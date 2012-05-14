/**
 * Created by JetBrains PhpStorm.
 * @author Tyutyunkov VE
 */

EinsteinController = function () {
    this.root = $('einstein-panel');

    this.buildField();
    this.initButtons();

    this.generate();

    this.resetField();
};

EinsteinController.prototype = {
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

                var img;
                img = this.cells[i][j] = Element.extend(document.createElement('img'));
                td.insert(img);

                img.setStyle({width:'102px', height:'102px'});
                img.hide();

                var itable = this.hints[i][j].view = Element.extend(document.createElement('table'));
                td.insert(itable);
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
                    itd.setStyle({width:'32px', border:'1px solid'});

                    iimg = this.hints[i][j].items[k] = Element.extend(document.createElement('img'));
                    itd.insert(iimg);

                    iimg.setStyle({width:'32px', height:'32px'});
                    iimg.src = 'images/' + (i + 1) + (k + 1) + '.gif';

                    itd.onmousedown = (function (scope, ii, ij, ik) {
                        return function (event) {
                            if (!scope.status) {
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
                    itd.setStyle({width:'32px', border:'1px solid'});

                    iimg = this.hints[i][j].items[k] = Element.extend(document.createElement('img'));
                    itd.insert(iimg);

                    iimg.setStyle({width:'32px', height:'32px'});
                    iimg.src = 'images/' + (i + 1) + (k + 1) + '.gif';

                    itd.onmousedown = (function (scope, ii, ij, ik) {
                        return function (event) {
                            if (!scope.status) {
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

    generate:function () {
        this.data = [];
        for (var i = 0; i < 6; ++i) {
            this.data[i] = [];

            var tmp = [1, 2, 3, 4, 5, 6];
            while (tmp.length > 0) {
                var item;
                var data = {
                    value:item = tmp.splice(Math.random() * tmp.length, 1)[0],
                    items:{count:6, 1:true, 2:true, 3:true, 4:true, 5:true, 6:true}};
                this.data[i].push(data);
            }
        }
    },

    resetField:function () {
        this.status = true;

        var i, j, k;
        for (i = 0; i < 6; ++i) {
            for (j = 0; j < 6; ++j) {
                this.cells[i][j].hide();
                this.hints[i][j].view.show();

//                //todo: it's debug
//                this.cells[i][j].show();
//                this.cells[i][j].src = 'images/' + (i+1) + (this.data[i][j].value) + '.gif';
//                this.hints[i][j].view.hide();
                for (k = 0; k < 6; ++k) {
                    this.hints[i][j].items[k].show();
                    this.hints[i][j].items[k].up().setStyle({width:'32px'});

                    // todo: it's debug
                    this.hints[i][j].items[k].up().setStyle({border:'1px solid ' + ((k + 1) == this.data[i][j].value ? 'red' : 'black')});
                }
            }
        }
    },

    initButtons:function () {
        $('new').onclick = (function (scope) {
            return function (event) {
                scope.generate();
                scope.resetField();
                return false;
            }
        })(this);
    },

    hintMouseDown:function (i, j, k, action) {
        // TODO:
        var data = this.data[i][j];
        var hintf = this.hints[i][j].view;
        var hint = this.hints[i][j].items[k];

        if (!data.items[(k+1)]) {
            return;
        }

        if (!action) { // right!
            if(data.value == (k+1)) {
                this.status = false;
            }
            --data.items.count;
            data.items[(k + 1)] = false;
            hint.up().setStyle({border:'none', width:'34px'});
            hint.hide();
            if (data.items.count == 1) {
                for (var h = 0; h < 6; ++h) {
                    if (data.items[(h + 1)]) {
                        (function (scope, ik) {
                            scope.hintMouseDown(i, j, ik, true);
                        })(this, h);
                    }
                }
            }
        } else {
            if(data.value != (k+1)) {
                this.status = false;
            }

            hintf.hide();
            this.cells[i][j].src = 'images/' + (i + 1) + (k + 1) + '.gif';
            this.cells[i][j].show();
            for (var n = 0; n < 6; ++n) {
                if (n != j) {
                    (function (scope, ij) {
                        scope.hintMouseDown(i, ij, k, false);
                    })(this, n);
                }
            }
        }
    },

    checkField:function() {
        if (!this.status) {
            alert('stop game');
        }
    }
};