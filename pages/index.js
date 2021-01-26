import { EmptyState, Layout, Page  } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import OrderQuantityMetrics from '../components/OrderQuantityMetrics';

// const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index = () => (
  <Page>
    <TitleBar
      title="Sample App"
      primaryAction={{
        content: 'Select products',
      }}
    />
    <Layout>
      <OrderQuantityMetrics/>
    </Layout>
  </Page>
);

export default Index;