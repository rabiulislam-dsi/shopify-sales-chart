const getSubscriptionUrl = async (accessToken, shop, returnUrl = process.env.HOST) => {
    const dev = process.env.NODE_ENV !== 'production';
    const query = JSON.stringify({
      query: `mutation {
        appSubscriptionCreate(
          name: "Super Duper Plan"
          returnUrl: "${returnUrl}"
          test: ${dev}
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: { amount: 0.01, currencyCode: USD }
                }
              }
            }
          ]
        )
        {
          userErrors {
            field
            message
          }
          confirmationUrl
          appSubscription {
            id
          }
        }
      }`
    });
  
    const response = await fetch(`https://${shop}/admin/api/2020-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-Shopify-Access-Token": accessToken,
      },
      body: query
    })
  
    const responseJson = await response.json();
    console.log(responseJson);
    console.log(responseJson.data.appSubscriptionCreate.userErrors);
    return responseJson.data.appSubscriptionCreate.confirmationUrl;
  };
  
  module.exports = getSubscriptionUrl;