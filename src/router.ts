import Demo from './comp';
import { createServer } from '../packages/coka/src';
import { Zix } from './static';
export default (application: ReturnType<typeof createServer>) => {
  application.createPathRule('/', Demo);
  application.createPathRule('/t', Zix);
}