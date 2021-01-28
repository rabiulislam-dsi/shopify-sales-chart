import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Card, Layout} from '@shopify/polaris';
import {transformResponseToChartData,getLastNDays} from '../utils/helpers';
import {OrdersLineChart,OrdersPieChart,OrdersBarChart} from './OrderDataCharts';

const GET_FULFILLMENT_ORDERS = gql`
  query	{
    shop	{
        id
        name
        email
        productTypes(first:10){
          edges{
            node
          }
        }
        fulfillmentOrders(first:10, includeClosed:true) {
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
          }
        }
    }
  }
`;

class OrderQuantityMetrics extends React.Component {
  render() {
    const lastDays=getLastNDays(7);
    return (
      <Query query={GET_FULFILLMENT_ORDERS}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;
          const {
            productTypes,
            lineChartData,
            pieChartData,
            countryBarChartData
          } = transformResponseToChartData(data,lastDays);
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


