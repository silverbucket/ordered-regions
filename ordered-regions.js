module.exports = class OrderedRegions {
    constructor(end, block) {
        this.end = end;
        this.block = block;
        this._stack = [];
        this._cycle = null;
    }

    onEach(item) { throw new Error("no handler set for onEach"); }
    onBlock(items) { throw new Error("no handler set for onBlock"); }
    onComplete() { throw new Error("no handler set for onComplete"); }

    /**
     * Submit an item to this collection.
     * @param item
     */
    submit(item) {
        let entry = {
            id: item.id,
            item: item,
            called: false
        };

        this._stack[entry.id] = entry;

        if (! this._cycle) {
            this._startCycle();
        }
    }

    _startCycle() {
        let nextBlock = 0;

        const callProcessBlock = (pos) => {
            this._processBlock(pos, nextBlock);
            nextBlock = pos + 1;
        };

        this._cycle = setInterval(() => {
            for (let i = nextBlock; i <= nextBlock + this.block; i++) {
                let blockCalled = false;

                if (!this._stack[i]) {
                    break;
                } else if (!this._stack[i].called) {
                    this._processEntry(i);
                }

                if (i === nextBlock + this.block - 1) {
                    blockCalled = true;
                    callProcessBlock(i);
                }

                if (i === this.end) {
                    if (! blockCalled) {
                        callProcessBlock(i)
                    }
                    clearInterval(this._cycle);
                    setTimeout(this.onComplete, 0);
                }
            }
        }, 500);
    }

    _processEntry(pos) {
        this._stack[pos].called = true;
        setTimeout(this.onEach.bind(null, this._stack[pos].item), 0);
    }

    _processBlock(pos, lastBlock) {
        let entries = [];
        for (let i = lastBlock; i <= pos; i++) {
            const e = this._stack[i];
            entries.push(e.item);
        }
        // console.log('_processBlock('+ pos +', ' + lastBlock + ') sending ' + entries.length + ' entries.');
        setTimeout(this.onBlock.bind(null, entries), 0);
    }
};