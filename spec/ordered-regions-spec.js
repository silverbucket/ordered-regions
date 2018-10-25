const OrderedRegions = require("../ordered-regions");


function arrayRange(a, b, step) {
    let range = [];

    if (typeof a === 'number') {
        range[0] = a;
        step = step || 1;
        while(a + step <= b) {
            range[range.length]= a += step;
        }
    } else {
        let s = 'abcdefghijklmnopqrstuvwxyz';
        if (a === a.toUpperCase()) {
            b = b.toUpperCase();
            s = s.toUpperCase();
        }
        s = s.substring(s.indexOf(a), s.indexOf(b) + 1);
        range = s.split('');
    }
    return range;
}

describe("OrderedRegions", () => {
    const MAX = 33,
          GROUP = 8,
          DIFF = 2;

    beforeEach(() => {
        this.or = new OrderedRegions(MAX, GROUP);
    });

    it("can be initialized", () => {
        expect(this.or.group).toEqual(GROUP);
    });

    it("handles onEach order", (done) => {
        let order_called = [];
        this.or.onEach = (item) => {
            order_called.push(item.id);
            expect(item.id).toEqual(order_called.length - 1);
            if (item.id === 3) {
                expect(order_called).toEqual([0, 1, 2, 3]);
                done();
            }
        };
        for (let i = 3; i >= 0; i--) {
            this.or.submit({id: i});
        }
    });

    it("handles onGroup", (done) => {
        let order_each = [];
        this.or.onEach = (item) => {
            order_each.push(item.id);
            expect(item.id).toEqual(order_each.length - 1);
            if (item.id === MAX) {
                const d = arrayRange(0, MAX);
                expect(order_each).toEqual(d);
            }
        };
        this.or.onGroup = (items) => {
            if (items[items.length - 1].id === MAX) {
                expect(items.length).toEqual(DIFF);
            } else {
                expect(items.length).toEqual(GROUP);
            }
        };

        this.or.onComplete = function () {
            done();
        };

        for (let i = MAX; i >= 0; i--) {
            this.or.submit({id: i});
        }
    });

    it("handles onComplete", (done) => {
        let order_each = [];
        let order_groups = [];

        this.or.onEach = (item) => {
            order_each.push(item.id);
            expect(item.id).toEqual(order_each.length - 1);
        };

        this.or.onGroup = (items) => {
            if (items[items.length - 1].id === MAX) {
                expect(items.length).toEqual(DIFF);
            } else {
                expect(items.length).toEqual(GROUP);
            }
            let item_ids = [];
            items.forEach((item) => {
                item_ids.push(item.id);
            });
            order_groups = order_groups.concat(item_ids);
        };

        this.or.onComplete = () => {
            const gen_order = arrayRange(0, MAX);
            expect(gen_order).toEqual(order_each);
            expect(order_each).toEqual(order_groups);
            done();
        };

        for (let i = MAX; i >= 0; i--) {
            this.or.submit({id: i});
        }
    });

    it("handles out of order items", (done) => {
        let order_called = [];
        this.or.onEach = (item) => {
            order_called.push(item.id);
            if (item.id === 3) {
                expect(order_called).toEqual([0, 1, 2, 3]);
                done();
            }
        };
        for (let i = 3; i >= 0; i--) {
            this.or.submit({id: i});
        }
    });
});

describe("OrderedRegions large random set", () => {
    it("can take large amounts of out of order items", (done) => {
        const MAX = 10,
              GROUP = 8,
              DIFF = 3;

        const or = new OrderedRegions(MAX, GROUP);
        let order_each = [];
        let order_groups = [];

        or.onEach = (item) => {
            order_each.push(item.id);
            expect(item.id).toEqual(order_each.length - 1);
        };

        or.onGroup = (items) => {
            if (items[items.length - 1].id === MAX) {
                expect(items.length).toEqual(DIFF);
            } else {
                expect(items.length).toEqual(GROUP);
            }
            let item_ids = [];
            items.forEach((item) => {
                item_ids.push(item.id);
            });
            order_groups = order_groups.concat(item_ids);
        };

        or.onComplete = () => {
            const gen_order = arrayRange(0, MAX);
            expect(gen_order).toEqual(order_each);
            // console.log(oneach_order);
            // console.log(order_called);
            expect(order_each).toEqual(order_groups);
            done();
        };

        let submition_stack = arrayRange(0, MAX);
        while (submition_stack.length !== 0) {
            const index = Math.floor(Math.random() * submition_stack.length);
            const item = submition_stack.splice(index, 1);
            or.submit({id: item[0]});
        }
    });
});