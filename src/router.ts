import Demo from './comp';
import { createServer } from '../packages/coka/src';
import { Zix } from './static';
import { Layout } from './layout';
export default (application: ReturnType<typeof createServer>) => {
  application.use(Layout);
  application.createPathRule('/p', Demo);
  application.createPathRule('/t', Zix);
}