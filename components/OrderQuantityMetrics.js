import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Card,TextStyle } from '@shopify/polaris';
import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis,Tooltip,Legend } from 'recharts';
import moment from 'moment';

const colors = [
  "#5899DA",
  "#E8743B",
  "#19A979",
  "#ED4A7B",
  "#945ECF",
  "#13A4B4",
  "#525DF4",
  "#BF399E",
  "#6C8893",
  "#EE6868",
  "#2F6497"
];
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
  state = {
    statsOfWeek:true
  }
  
  transformOrderData = (responseData) =>{
    const productTypes = responseData.shop.productTypes.edges;
    const fulfillmentOrders = responseData.shop.fulfillmentOrders.edges;
    const lastDays = this.getLastNDays(7);

    // init a object like {type1:0,type2:0}
    const initProductTypeWithCount = productTypes.reduce(function(pi,ci){
      pi[ci.node]=0;
      return pi;
    },{});

    //traverse the dates and push initProductTypeWithCount along with a date
    const chartDataTemplate = lastDays.reduce(function(pi,ci){
      pi[ci]= {date:ci , ...initProductTypeWithCount};
      return pi;
    },{});
    //now just find product (date,count) and then update in template
    for(let i = 0 ; i < fulfillmentOrders.length ; i++){
      const orderDate = moment(fulfillmentOrders[i].node.order.createdAt).format('YYYY-MM-DD');
      for(let j = 0 ; j < fulfillmentOrders[i].node.lineItems.edges.length ; j++){
        const singleProduct = fulfillmentOrders[i].node.lineItems.edges[j].node;
        const productQuantity= singleProduct.totalQuantity;
        const productType = singleProduct.lineItem.product.productType;
        chartDataTemplate[orderDate][productType] =  chartDataTemplate[orderDate][productType] + productQuantity;
      }
    }
 
    return {chartData:Object.values(chartDataTemplate).reverse(),productTypes};
  }

  getLastNDays=(n)=>{
    const today = moment();
    const res = Array(n).fill().map(
      () => today.subtract(1, 'd').format('YYYY-MM-DD')
    );
    return res;
  }

  render() {

    return (
      <Query query={GET_FULFILLMENT_ORDERS}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;
          const {chartData,productTypes} = this.transformOrderData(data);
          console.log(chartData);
          console.log(productTypes);
          const Lines = productTypes.map((elm,idx)=>(           
            <Line
            key={elm.node+idx}
            name={elm.node}
            type="monotone"
            dataKey={elm.node}
            stroke={colors[idx]}
            strokeWidth={2}
            />
          ));
          return (
              <Card title="Sales Count By Category">
                {/* <TextStyle variation="positive">
                  
                </TextStyle> */}
                <LineChart width={1000} height={250} data={chartData}
                  margin={{ top: 25, right: 50, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Lines}
                </LineChart>
              </Card>
          );
        }}
      </Query>
    );
  }
}

 export default OrderQuantityMetrics;

//  query:"created_at:>2018-11-01 created_at:<2018-11-31"


