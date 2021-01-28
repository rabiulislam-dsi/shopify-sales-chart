import { Layout, Page } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import OrderQuantityMetrics from '../components/OrderQuantityMetrics';

const Index = () => (
  <Page>
    <TitleBar
      title="Sample App"
      primaryAction={{
        content: 'Go to orders page',
        onAction:()=>{console.log('clicked')}
      }}
    />
    <div style={{marginTop:50}}>
                
    </div>
    <Layout>
      <OrderQuantityMetrics/>
    </Layout>
  </Page>
);

export default Index;