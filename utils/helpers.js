import moment from 'moment';
import {barColors} from './colors';

export const transformResponseToChartData = (productTypesFromRes,orders,lastDays) =>{
    const productTypes = productTypesFromRes;
    const fulfillmentOrders = orders;
    const countryWiseProductQuantity = {};
    const pieChartDataUnsorted=[];

    // init a object like {type1:0,type2:0}
    const initProductTypeWithCount = productTypes.reduce(function(pi,ci){
      pi[ci.node]=0;
      return pi;
    },{});

    //traverse the dates and push initProductTypeWithCount along with a date
    const lineChartDataTemplate = lastDays.reduce(function(pi,ci){
      pi[ci]= {date:ci , ...initProductTypeWithCount};
      return pi;
    },{});

    //now just find product (date,count) and then update in template
    for(let i = 0 ; i < fulfillmentOrders.length ; i++){
      const orderDate = moment(fulfillmentOrders[i].node.order.createdAt).format('YYYY-MM-DD');
      const shippingAddressCountry = fulfillmentOrders[i].node.order.shippingAddress?fulfillmentOrders[i].node.order.shippingAddress.country:"Unknown";
      for(let j = 0 ; j < fulfillmentOrders[i].node.lineItems.edges.length ; j++){
        const singleProduct = fulfillmentOrders[i].node.lineItems.edges[j].node;
        const productQuantity= singleProduct.totalQuantity;
        countryWiseProductQuantity[shippingAddressCountry]=countryWiseProductQuantity[shippingAddressCountry] 
                                                          ? countryWiseProductQuantity[shippingAddressCountry]+singleProduct.totalQuantity 
                                                          : singleProduct.totalQuantity;
        const productType = singleProduct.lineItem.product.productType;
        if(lineChartDataTemplate[orderDate]){
            lineChartDataTemplate[orderDate][productType] =  lineChartDataTemplate[orderDate][productType] + productQuantity;
        }
      }
    }

    const lineChartData=Object.values(lineChartDataTemplate).reverse();
     // add pieChartData
    for(let i=0;i<productTypes.length;i++){
      let productType = productTypes[i].node;
      let productQuantity=0;
      for(let j=0;j<lineChartData.length;j++){
        productQuantity+=lineChartData[j][productType];
      }
      pieChartDataUnsorted.push({name:productType,value:productQuantity});
    }
    const pieChartData = pieChartDataUnsorted.sort((a,b) => (a.value> b.value) ? -1 : ((b.value > a.value) ? 1 : 0));
    
    const countryBarChartData = Object.entries(countryWiseProductQuantity)
                .map((e,i) => ( { name:[e[0]],productQuantity: e[1],fill:barColors[i] } ))
                .sort((a,b) => (a.productQuantity> b.productQuantity) ? 1 : ((b.productQuantity > a.productQuantity) ? -1 : 0));

    return {productTypes,lineChartData,pieChartData,countryBarChartData};
}

export const getLastNDays=(n)=>{
    const tomorrow = moment().add(1,'d');
    const res = Array(n).fill().map(
      () => tomorrow.subtract(1, 'd').format('YYYY-MM-DD')
    );
    return res;
}

export const substracNDate=(n)=>{
    const today = moment();
    return today.subtract(n, 'd').format('YYYY-MM-DD')
}