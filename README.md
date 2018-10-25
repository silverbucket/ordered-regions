# ordered-regions

submit out of order objects and receive that data ordered sequentially and/or in groups

## install

`$ npm install ordered-regions`

## usage

```javascript
import OrderedRegions from 'ordered-regions';

const TOTAL = 32;
const or = OrderedRegions({
  total: TOTAL,
  groups: 8
});

or.onEach((item) => {
  console.log('item recevied in order');
});

or.onGroup((items) => {
  console.log('ordered group of items recevied');
});

or.onComplete(() => {
  console.log('finished ordering items');
});

for (let i = TOTAL; i >= 0; i--) {
  or.submit({id: i});
}
```