import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Card, Layout} from '@shopify/polaris';
import {transformResponseToChartData,getLastNDays} from '../utils/helpers';
import {OrdersLineChart,OrdersPieChart,OrdersBarChart} from './OrderDataCharts';

const GET_FULFILLMENT_ORDERS = gql`
  query($cursor: String){
    shop	{
        id
        name
        email
        productTypes(first:10){
          edges{
            node
          }
        }
        fulfillmentOrders(first:10, includeClosed:true, after:$cursor) {
          edges {
            node {
              status
              order{
                shippingAddress{
                  country
                }
                createdAt
              }
              lineItems(first:10) {
                edges {
                  node {
                    totalQuantity
                    lineItem {
                      discountedUnitPriceSet {
                        presentmentMoney {
                          amount
                          currencyCode
                        }
                      }
                      name
                      product {
                        productType
                        status
                        totalInventory
                      }
                    }
                  }
                }
              }
            }
            cursor
          }
          pageInfo{
						hasNextPage
          }
        }
    }
  }
`;

function getLastCursorInResponse(data){
  const orders = data.shop.fulfillmentOrders.edges;
  if(orders.length==0) return null;
  const lastItemInOrders = orders[orders.length - 1];
  //console.log(lastItemInOrders);
  return lastItemInOrders.cursor;
}

class OrderQuantityMetrics extends React.Component {
  state ={
    cursor:null,
    hasNextPage:true,
    orders:[],
    productTypes:[]
  };

  render() {
    const {cursor,hasNextPage}=this.state;
    const lastDays=getLastNDays(7);
    return (
      <Query query={GET_FULFILLMENT_ORDERS} variables={{cursor}} onCompleted={(data)=>{
        if(data && hasNextPage){
          this.setState({
            hasNextPage:data.shop.fulfillmentOrders.pageInfo.hasNextPage,
            cursor:getLastCursorInResponse(data),
            orders:[...this.state.orders,...data.shop.fulfillmentOrders.edges],
            productTypes:[...data.shop.productTypes.edges]
          });
        }
      }}>
        {({ loading, error }) => {

          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;

          const {
            productTypes,
            lineChartData,
            pieChartData,
            countryBarChartData
          } = transformResponseToChartData(this.state.productTypes,this.state.orders,lastDays);
          return (
              <>
                <Card title="Sales Report Per Product and Product-Type">
                  <OrdersLineChart lineChartData={lineChartData} productTypes={productTypes}/>
                </Card>
                <Layout.Section oneHalf margin={0}>
                  <Card title="Sales Per Product Type">
                    <OrdersPieChart pieChartData={pieChartData}/>
                  </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Card title="Sales In Different Countries">
                    <OrdersBarChart countryBarChartData={countryBarChartData}/>
                  </Card>
                </Layout.Section>
              </>
          );
        }}
      </Query>
    );
  }
}

 export default OrderQuantityMetrics;


