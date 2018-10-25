class OrderedRegions {
    /**
     *
     * @param {int} total call onComplete when this total number of ordered segments collected
     * @param {int} group call onGroup handler each time this number of ordered segments collected
     */
    constructor(total, group) {
        this.total = total;
        this.group = group;
        this._stack = [];
        this._cycle = null;
    }

    onEach(item) { throw new Error("no handler set for onEach"); }
    onGroup(items) { throw new Error("no handler set for onGroup"); }
    onComplete() { throw new Error("no handler set for onComplete"); }

    /**
     * Submit an item to this collection.
     * @param {object} item must contain an id property with an int indicating position
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

        const callProcessGroup = (pos) => {
            this._processGroup(pos, nextBlock);
            nextBlock = pos + 1;
        };

        this._cycle = setInterval(() => {
            for (let i = nextBlock; i <= nextBlock + this.group; i++) {
                let blockCalled = false;

                if (!this._stack[i]) {
                    break;
                } else if (!this._stack[i].called) {
                    this._processEntry(i);
                }

                if (i === nextBlock + this.group - 1) {
                    blockCalled = true;
                    callProcessGroup(i);
                }

                if (i === this.total) {
                    if (! blockCalled) {
                        callProcessGroup(i)
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

    _processGroup(pos, lastBlock) {
        let entries = [];
        for (let i = lastBlock; i <= pos; i++) {
            const e = this._stack[i];
            entries.push(e.item);
        }
        // console.log('_processGroup('+ pos +', ' + lastBlock + ') sending ' + entries.length + ' entries.');
        setTimeout(this.onGroup.bind(null, entries), 0);
    }
};

module.exports = OrderedRegions;