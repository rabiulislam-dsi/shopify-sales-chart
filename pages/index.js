import { Layout, Page } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import OrderQuantityMetrics from '../components/OrderQuantityMetrics';

const Index = () => (
  <Page>
    <div style={{marginTop:50}}>
                
    </div>
    <Layout>
      <OrderQuantityMetrics/>
    </Layout>
  </Page>
);

export default Index;