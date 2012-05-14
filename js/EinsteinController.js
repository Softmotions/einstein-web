/**
 * Created by JetBrains PhpStorm.
 * @author Tyutyunkov VE
 */

// TODO:
// alert('( ' + i + ', ' + j + ', ' + k + ')');

EinsteinController = function (size) {
    this.size = size || 6;
    this.root = $('einstein-panel');

    this.initField();
    this.initButtons();

    this.newGame();
};

EinsteinController.prototype = {
    initField:function () {
        this.vc = new ViewController(this.size);
    },

    initButtons:function () {
        $('new').onclick = (function (scope) {
            return function (event) {
                scope.newGame();
                return false;
            }
        })(this);
    },

    newGame:function () {
        this.data = new DataField(this.size);
        this.gc = new GameController(this.data);
        this.vc.setGameController(this.gc);
        this.vc.resetField();
        this.gc.start();
    }
};

DataField = function (size) {
    this.size = size;

    this.generate();
};

DataField.prototype = {
    generate:function () {
        this.data = [];
        for (var i = 0; i < 6; ++i) {
            this.data[i] = [];

            var tmp = [];
            for (var j = 0; j < this.size; ++j) {
                tmp.push(j);
            }

            while (tmp.length > 0) {
                this.data[i].push(tmp.splice(Math.random() * tmp.length, 1)[0]);
            }
        }
    },

    getSize:function () {
        return this.size;
    },

    getValue:function (i, j) {
        return this.data[i][j];
    }
};

GameController = function (data) {
    this.data = data;
    this.size = this.data.getSize();

    this.init();
};

GameController.prototype = {
    init:function () {
        this.count = this.size * this.size;
        this.field = [];
        for (var i = 0; i < this.size; ++i) {
            this.field[i] = [];
            for (var j = 0; j < this.size; ++j) {
                var items;
                this.field[i][j] = {
                    posible:this.size,
                    items  :items = {},
                    defined:null
                };
                for (var k = 0; k < this.size; ++k) {
                    items[k] = true;
                }
            }
        }
    },

    isPosible:function (i, j, k) {
        return !this.isDefined(i, j) && this.field[i][j].items[k];
    },

    isDefined:function (i, j) {
        return this.field[i][j].defined !== null;
    },

    getDefined:function (i, j) {
        return this.field[i][j].defined;
    },

    set:function (i, j, k) {
        if (!this.isPosible(i, j, k)) {
            return;
        }

        if (this.data.getValue(i, j) != k) {
            this.status = 3;
        }

        this.field[i][j].defined = k;
        for (var h = 0; h < this.size; ++h) {
            this.exclude(i, h, k);
        }
        if (this.onSet) {
            this.onSet(i, j, k);
        }
    },

    exclude:function (i, j, k) {
        if (!this.isPosible(i, j, k)) {
            return;
        }

        if (this.data.getValue(i, j) === k) {
            this.status = 3;
        }

        --this.field[i][j].posible;
        this.field[i][j].items[k] = false;
        if (this.onExclude) {
            this.onExclude(i, j, k);
        }
        if (this.field[i][j].posible == 1) {
            for (var h = 0; h < this.size; ++h) {
                if (this.field[i][j].items[h]) {
                    this.set(i, j, h);
                    break;
                }
            }
        }
    },

    setSetListener:function (listener) {
        this.onSet = listener;
    },

    setExcludeListener:function (listener) {
        this.onExclude = listener;
    },

    isActive:function () {
        return this.status === 1;
    },

    isFail:function () {
        return this.status === 3;
    },

    isVictory:function () {
        return this.status === 2;
    },

    start: function() {
        this.status = 1;
    }
};

ViewController = function (size) {
    this.size = size;
    this.root = $('einstein-panel');

    this.buildField();
};

ViewController.prototype = {
    buildField:function () {
        this.cells = [];
        this.hints = [];

        this.root.update();
        this.root.oncontextmenu = function (event) {
            return false;
        };
        for (var i = 0; i < 6; ++i) {
            this.cells[i] = [];
            this.hints[i] = [];

            var tr = Element.extend(document.createElement('tr'));
            this.root.insert(tr);
            tr.setStyle({height:'104px'});
            for (var j = 0; j < 6; ++j) {
                this.hints[i][j] = {items:[]};

                var td = Element.extend(document.createElement('td'));
                tr.insert(td);
                td.setStyle({width:'102px'});
                td.align = 'center';

                var img;
                img = this.cells[i][j] = Element.extend(document.createElement('img'));
                td.insert(img);

                img.setStyle({width:'102px', height:'102px'});
                img.hide();

                var itable = this.hints[i][j].view = Element.extend(document.createElement('table'));
                td.insert(itable);
                itable.setStyle({width: '102px'});
                itable.cellSpacing = 0;
                itable.cellPadding = 0;
                var itbody = Element.extend(document.createElement('tbody'));
                itable.insert(itbody);

                var itr, itd, iimg, k;
                itr = Element.extend(document.createElement('tr'));
                itbody.insert(itr);
                itr.setStyle({height:'34px'});
                for (k = 0; k < 3; ++k) {
                    itd = Element.extend(document.createElement('td'));
                    itr.insert(itd);
                    itd.setStyle({width:'32px', cursor:'pointer', border:'1px solid'});

                    iimg = this.hints[i][j].items[k] = Element.extend(document.createElement('img'));
                    itd.insert(iimg);

                    iimg.setStyle({width:'32px', height:'32px'});
                    iimg.src = 'images/' + (i + 1) + (k + 1) + '.gif';

                    itd.onmousedown = (function (scope, ii, ij, ik) {
                        return function (event) {
                            if (!scope.isActive()) {
                                return false;
                            }
                            scope.hintMouseDown(ii, ij, ik, event.button != 2);
                            scope.checkField();
                            return false;
                        }
                    })(this, i, j, k);
                }
                itr = Element.extend(document.createElement('tr'));
                itbody.insert(itr);
                itr.setStyle({height:'34px'});
                for (k = 3; k < 6; ++k) {
                    itd = Element.extend(document.createElement('td'));
                    itr.insert(itd);
                    itd.setStyle({width:'32px', cursor:'pointer', border:'1px solid'});

                    iimg = this.hints[i][j].items[k] = Element.extend(document.createElement('img'));
                    itd.insert(iimg);

                    iimg.setStyle({width:'32px', height:'32px'});
                    iimg.src = 'images/' + (i + 1) + (k + 1) + '.gif';

                    itd.onmousedown = (function (scope, ii, ij, ik) {
                        return function (event) {
                            if (!scope.isActive()) {
                                return false;
                            }
                            scope.hintMouseDown(ii, ij, ik, event.button != 2);
                            scope.checkField();
                            return false;
                        }
                    })(this, i, j, k);
                }
            }
        }
    },

    resetField:function () {
        var i, j, k;
        for (i = 0; i < 6; ++i) {
            for (j = 0; j < 6; ++j) {
                this.cells[i][j].hide();
                this.hints[i][j].view.show();

//                //todo: it's debug
//                this.cells[i][j].show();
//                this.cells[i][j].src = 'images/' + (i+1) + (this.data.field[i][j].value) + '.gif';
//                this.hints[i][j].view.hide();
                for (k = 0; k < 6; ++k) {
                    this.hints[i][j].items[k].show();
                    this.hints[i][j].items[k].up().setStyle({width:'32px'});

                    // todo: it's debug
                    this.hints[i][j].items[k].up().setStyle({border:'1px solid ' + (k == this.game.data.getValue(i, j) ? 'red' : 'black')});
                }
            }
        }
    },

    setGameController:function (gc) {
        this.game = gc;
        this.game.setSetListener((function (scope) {
            return function (i, j, k) {
                scope.onSet(i, j, k);
            }
        })(this));
        this.game.setExcludeListener((function (scope) {
            return function (i, j, k) {
                scope.onExclude(i, j, k);
            }
        })(this));
    },

    hintMouseDown:function (i, j, k, isSet) {
        if (isSet) {
            this.game.set(i, j, k);
        } else {
            this.game.exclude(i, j, k);
        }
    },

    onSet:function (i, j, k) {
        this.hints[i][j].view.hide();
        this.cells[i][j].src = 'images/' + (i + 1) + (k + 1) + '.gif';
        this.cells[i][j].show();
    },

    onExclude:function (i, j, k) {
        this.hints[i][j].items[k].up().setStyle({width: '34px', border:'0'});
        this.hints[i][j].items[k].hide();
    },

    isActive:function () {
        return this.game && this.game.isActive();
    },

    checkField:function () {
        if (!this.isActive()) {
            if (this.game && this.game.isVictory()) {
                alert('victory');
                return;
            }
            if (this.game && this.game.isFail()) {
                alert('fail');
                return;
            }
            // TODO: unexpected status
        }
    }
};