Class("xui.UI.PopMenu",["xui.UI.Widget","xui.absList"],{
    Instance:{
        adjustSize:function(){
            this.each(function(profile){
                if(profile.renderId){
                    var root=profile.getRoot();
                    if(root.css('display')=='none'){
                        profile._needadjust=1;
                        return;
                    }
                    var border = profile.getSubNode('BORDER'),
                        box = profile.getSubNode('BOX'),
                        items = profile.getSubNode('ITEMS'),
                        itemNs = profile.getSubNode('ITEM',true),
                        pro=profile.properties,
                        ww=0,hh=0;
                       
                       items.cssSize({width:'auto',height:'auto'});
 
                        hh = items.height();
                        if(hh%2==1)hh+=1;
                        items.addClass(profile.getClass('ITEMS','-inline'));
                        itemNs.each(function(n){
                            ww=Math.max(ww, n.offsetWidth);
                        });
                        if(ww%2==1)ww+=1;
                        items.removeClass(profile.getClass('ITEMS','-inline'));

                    // for IE7
                    items.cssSize({width:ww,height:hh});

                    var h = Math.min(pro._maxHeight, hh),
                        w = Math.min(pro._maxWidth, ww),
                        size={width:w ,height:h};
                    pro.width=w;
                    pro.height=h;
                    root.cssSize(size);
                    box.cssSize(size);
                    border.cssSize(size);
                }
            });
            return this._setScroll();
        },
        _setScroll:function(){
            return this.each(function(profile){
                if(profile.renderId){
                    var o=profile.getSubNode('ITEMS'),
                        t=o.offsetTop(),
                        h=o.offsetHeight(),
                        b = profile.getRoot(),
                        hh=b.offsetHeight();
                    profile.getSubNode('TOP').css('display',t===0?'none':'block');
                    profile.getSubNode('BOTTOM').css('display',(hh>=h+t)?'none':'block');
                }
            })
        },
        _scrollToBottom:function(){
            return this.each(function(profile){
                var o = profile.getSubNode('ITEMS'),
                border = profile.getSubNode('BORDER'),
                y = o.offsetTop(),
                offset,
                h = o.offsetHeight(),
                b=false,
                bh = border.height();
                if(bh<h+y){
                    if(!profile.$scrollStep)profile.$scrollStep=1;

                    if(profile.$scrollStep<5)
                        profile.$scrollStep = profile.$scrollStep*1.01;

                    y -= profile.$scrollStep;
                    if(bh>h+y){
                        y=bh-h;
                        b=true;
                    }
                    o.top(y);
                    if(b){
                        profile.getSubNode('BOTTOM').css('display','none');
                        profile.$scrollTobottom=false;
                        profile.$scrollStep=null;
                    }else{
                        profile.getSubNode('TOP').css('display','block');
                        if(profile.$scrollTobottom)
                            _.asyRun(arguments.callee, 0, [profile], this);
                    }
                }
            });
        },
        _scrollToTop:function(){
            return this.each(function(profile){
                var o = profile.getSubNode('ITEMS'),
                y = o.offsetTop(),
                b=false;

                if(y<0){
                    if(!profile.$scrollStep)profile.$scrollStep=1;

                    if(profile.$scrollStep<5)
                        profile.$scrollStep = profile.$scrollStep*1.01;

                    y += profile.$scrollStep;
                    if(y>=-1){
                        y=0;
                        b=true;
                    }
                    o.top(y);
                    if(b){
                        profile.getSubNode('TOP').css('display','none');
                        profile.$scrollToTop=false;
                        profile.$scrollStep=null;
                    }else{
                        profile.getSubNode('BOTTOM').css('display','block');
                        if(profile.$scrollToTop)
                            _.asyRun(arguments.callee, 0, [profile], this);
                    }
                }
            });
        },
        pop:function(obj, type, parent,ignoreEffects){
            var profile=this.get(0),
                p=profile.properties,
                sms='$subPopMenuShowed',
                hl='$highLight',
                cm='$childPopMenu';
            //ensure rendered
            if(!profile.renderId){
                var o=profile.boxing().render(true);
                //use empty idv for LayoutTrigger
                xui.Dom.getEmptyDiv().append(o);
            }
            var root = profile.getRoot();

            //clear highLight first
            if(profile.$highLight)
                xui([profile.$highLight]).tagClass('-mouseover',false);
            profile._conainer=parent;

            root.popToTop(obj, type, parent);

            if(profile._needadjust){
                delete profile._needadjust;
                profile.boxing().adjustSize();
            };

            var f=function(){
                var p=arguments.callee.profile;
                // maybe destroyed here
                if(p.box){
                    p.boxing().hide();
                    if(p.$popGrp)
                        p.$popGrp.length=0;
                }
            };
            f.profile=profile;

            if(!profile.$popGrp || !profile.$popGrp.length){
                profile.$popGrp = [root._get(0)];
                //group blur trigger
                root.setBlurTrigger(profile.$xid, null);
                root.setBlurTrigger(profile.$xid, f, profile.$popGrp);
            }
            profile[cm]=profile[sms]=profile[hl]=null;
            return this;
        },
        hide:function(triggerEvent, ignoreEffects , e){
            var t,
                profile=this.get(0),
                p=profile.properties,
                root=profile.getRoot(),
                sms='$subPopMenuShowed',
                hl='$highLight',
                cm='$childPopMenu',
                fun=function(){
                    if(false!==triggerEvent)
                        if(false===profile.boxing().beforeHide(profile, ignoreEffects, e))
                            return this;

                    if(!root || root.css('display')=='none')return;

                    //remove trigger
                    root.setBlurTrigger(profile.$xid,null);
                    if(profile.$hideMenuPool)
                        profile.$hideMenuPool.append(root);
                    else
                        root.css('display','none');

                    if(t=profile[hl])
                       xui([t]).tagClass('-mouseover',false);

                    //hide all parent pop
                    var p=profile[cm],q;
                    if(t=profile[sms])t.hide(triggerEvent, ignoreEffects);
                    while(p){
                        p.boxing().hide(triggerEvent, ignoreEffects);
                        p=(q=p)[cm];
                        q[cm] = q[sms] = q[hl] = null;
                    }
                    profile[cm]=profile[sms]=profile[hl]=null;
                    if(t=profile.$parentPopMenu)t[sms]=null;

                    if(profile.$popGrp)
                        _.arr.removeValue(profile.$popGrp,root._get(0));

                    if(false!==triggerEvent)
                        profile.boxing().onHide(profile);
                };
            root.hide(fun,null,ignoreEffects);
            return this;
        },
        _afterInsertItems:function(profile){
            if(!profile.renderId)return;
            profile.boxing().adjustSize();
        },
        _afterRemoveItems:function(profile){
            if(!profile.renderId)return;
            profile.boxing().adjustSize();
        }
    },
    Initialize:function(){
        //modify default template fro shell
        var t = this.getTemplate();
        _.merge(t.FRAME.BORDER,{
            className:"xui-uiborder-outset",
             TOP:{},
             BOTTOM:{},
             BOX:{
                tagName:'div',
                className:"xui-uibg-base",
                BOXBGBAR:{
                    tabName:'div'
                },
                 ITEMS:{
                    tagName:'div',
                    text:"{items}"
                 }
             },
             POOL:{}
        },'all');
        t.$submap = {
            'items':function(profile,template,v,tag,result){
                var t;
                tag = tag+'.'+v.type;
                //for xui.UI or xui.Template
                if(t=v.object){
                    //[v] is for xui.Template
                    result[result.length]=t.build(v);
                }else{
                    if(template[tag])
                        xui.UI.$doTemplate(profile,template,v,tag,result);
                }
             },
            'items.split':{
                ITEMSPLIT:{
                    style:"{_itemDisplay}",
                    className:'xui-uiborder-t'
                }
            },
            'items.button':{
                ITEM:{
                    tabindex: -1,
                    className: ' xui-uibarbg2 {itemClass} {disabled}',
                    style:'{itemStyle}{_itemDisplay}',
                    ICON:{
                        $order:0,
                        className:'xui-ui-icon {imageClass}',
                        style:'{backgroundImage} {backgroundPosition} {backgroundRepeat}'
                    },
                    CAPTION:{
                        text : '{caption}',
                        $order:1
                    },
                    RULER:{
                        style:'{displayAdd}',
                        $order:2
                    },
                    ADD:{
                        tagName : 'div',
                        style:'{displayAdd}',
                        text : '{add}',
                        $order:2
                    },
                    SUB:{style:'{displaySub}'}
                }
            },
            'items.checkbox':{
                ITEM:{
                    tabindex: -1,
                    className: '{itemClass} {disabled}',
                    style:'{itemStyle}{_itemDisplay}',
                    CHECKBOX:{
                        $order:0,
                         className:'xui-ui-icon {checkboxCls}'
                    },
                    CAPTION:{
                        text : '{caption}',
                        $order:1
                    },
                    RULER:{
                        style:'{displayAdd}',
                        $order:2
                    },
                    ADD:{
                        tagName : 'div',
                        style:'{displayAdd}',
                        text : '{add}',
                        $order:2
                    }
                }
            },
            'items.radiobox':{
                ITEM:{
                    tabindex: -1,
                    className: '{itemClass} {disabled}',
                    style:'{itemStyle}{_itemDisplay}',
                    RADIOBOX:{
                        $order:0,
                         className:'xui-ui-icon {radioboxCls}'
                    },
                    CAPTION:{
                        text : '{caption}',
                        $order:1
                    },
                    RULER:{
                        style:'{displayAdd}',
                        $order:2
                    },
                    ADD:{
                        tagName : 'div',
                        style:'{displayAdd}',
                        text : '{add}',
                        $order:2
                    }
                }
            }
        };
        this.setTemplate(t);
    },
    Static:{
        $initRootHidden:true,
        Appearances:{
            KEY:{
                visibility:'hidden'
            },
            POOL:{
                'font-size':'0',
                'line-height':'0',
                position:'absolute',
                display:'none'
            },
            BOX:{
                overflow:'hidden',
                position:'relative',
                'z-index':'3'
            },
            BORDER:{
                position:'relative'
            },
            ITEMS:{
                position:'relative',
                top:0,
                left:0,
                overflow:'hidden'
            },
            BOXBGBAR:{
                'z-index':-1,
                position:'absolute',
                'background-color':'#CCE4FC',
                left:0,
                top:0,
                width:'22px',
                height:'100%'
            },
            'ITEMS-inline ITEM':{
                $order:5,
                display:xui.$inlineBlock
            },
            ITEM:{
                display:'block',
                position:'relative',
                overflow:'visible',
                'white-space': 'nowrap',
                'font-family': '"Verdana", "Helvetica", "sans-serif"',
                cursor:'pointer',
                padding:'2px 20px 2px 2px',
                outline:0
            },
            ITEMSPLIT:{
                display:'block',
                position:'relative',
                overflow:'visible',
                'white-space': 'nowrap',
                'font-size':'1px',
                'line-height':'1px',
                margin:'2px 2px 2px 26px'
            },
            ICON:{
                margin:0
            },
            TOP:{
                cursor:'pointer',
                display:'none',
                position:'absolute',
                'margin-left':'-8px',
                right:0,
                height:'16px',
                width:'16px',
                'z-index':'10',
                top:0,
               'background-image':xui.UI.$bg('icons.gif', '', true),
               'background-repeat':'no-repeat',
               'background-position':'-48px -244px'
            },
            BOTTOM:{
                cursor:'pointer',
                display:'none',
                position:'absolute',
                'margin-left':'-8px',
                right:0,
                height:'16px',
                width:'16px',
                'z-index':'10',
                bottom:0,
               'background-image':xui.UI.$bg('icons.gif', '', true),
               'background-repeat':'no-repeat',
               'background-position':'-66px -244px'
            },
            'RADIOBOX, CHECKBOX, RADIOBOX-checked, CHECKBOX-checked':{
                cursor:'pointer',
                'vertical-align':'middle',
                width:'16px',
                height:'16px'
            },
            CHECKBOX:{
               'background-image':xui.UI.$bg('icons.gif', '', true),
               'background-repeat':'no-repeat',
               'background-position':'-20px -70px',
               margin:0
            },
            'CHECKBOX-checked':{
               $order:1,
               'background-image':xui.UI.$bg('icons.gif', '', true),
               'background-repeat':'no-repeat',
               'background-position':'0 -70px'
            },
            RADIOBOX:{
               'background-image':xui.UI.$bg('icons.gif', '', true),
               'background-repeat':'no-repeat',
               'background-position':'-60px -70px',
               margin:0
            },
            'RADIOBOX-checked':{
               $order:1,
                'background-image':xui.UI.$bg('icons.gif', '', true),
                'background-repeat':'no-repeat',
                'background-position':'-40px -70px'
            },
            CAPTION:{
                'vertical-align':xui.browser.ie6?'baseline':'middle',
                'padding-left':'6px'
            },
            RULER:{
                width:'100px',
                'font-size':0,
                'line-height':0
            },
            ADD:{
                position:'absolute',
                top:'3px',
                right:0,
                width:'80px',
                'padding-right':'20px',
                'text-align':'right',
                'z-index':'10',
                zoom:xui.browser.ie?1:null
            },
            SUB:{
                position:'absolute',
                top:'2px',
                right:'6px',
                width:'8px',
                height:'16px',
                'background-image':xui.UI.$bg('icons.gif', '', true),
                'background-repeat':'no-repeat',
                'background-position':'-200px -70px'
            }
        },
        Behaviors:{
            ITEM:{
                onMouseover:function(profile, e, src){
                    var sms='$subPopMenuShowed',
                        all='$allPops',
                        hl='$highLight',
                        showp='$showpops',
                        popgrp='$popGrp';
                    //for stop second trigger by focus event
                    if(profile[hl] == src)return;

                    var properties = profile.properties,
                        item = profile.getItemByDom(src),
                        itemId = item.id,
                        Cancel = false,
                        pop,popp,t;
                    //if sub pop menu showed
                    if(t=profile[sms]){
                        //if the showed menu is self
                        if(t == _.get(profile,[all,itemId]))
                            Cancel=true;
                        else{
                            t.hide();
                            profile[sms] = null;
                        }
                    }
                    if(!Cancel){
                        if(t=profile[hl])
                            xui([t]).tagClass( '-mouseover',false);
                        profile[hl] = src;
                        xui.use(src).tagClass('-mouseover');
                        //don't fire events here
                        try{xui.use(src).get(0).focus()}catch(e){}
                    }

                    if(!Cancel && item.sub){
                        // if no sub arrays
                        if(!(_.isArr(item.sub) && item.sub.length)){
                            if(profile.onShowSubMenu){
                                var r=profile['$sub:'+item.id];
                                if(r && r['xui.UI'] && !r.isEmpty()){}
                                else
                                    r=profile.boxing().onShowSubMenu(profile, item, src);

                                // return UI control
                                if(r && r['xui.UI'] && !r.isEmpty()){
                                    profile[sms] = r;
                                    r=r.reBoxing();
                                    r.onMouseout(function(p,e,src){
                                        profile.box._mouseout(profile, e, src);
                                    },null,-1);
                                    profile[popgrp].push(r._get(0));

                                    r.popToTop(src,2,profile._conainer);

                                    return;
                                }
                                // return items array
                                else if(r && _.isArr(r) && r.length){
                                    item.sub=r;
                                }
                            }
                        }

                        // show items
                        if(_.isArr(item.sub) && item.sub.length){
                            profile[all] = profile[all] || {};

                            //no create
                            if(!(pop = profile[all][itemId])){
                                var pro=profile.properties;
                                pop = (new xui.UI.PopMenu({position:'absolute', items:item.sub, autoHide:pro.autoHide, showEffects:pro.showEffects, hideEffects:pro.hideEffects})).render(true);
                                pop.onShowSubMenu(function(pro, item, src){
                                    return profile.boxing().onShowSubMenu(profile, item, src);
                                });
                                pop.onMenuSelected(function(pro, item, src){
                                    return profile.boxing().onMenuSelected(profile, item, src);
                                });
                                popp=pop.get(0);
                                //set pool to parent
                                popp.$hideMenuPool = profile.$hideMenuPool || profile.getSubNode('POOL');

                                profile[all][itemId] = pop;

                                //collect
                                profile[showp] = profile[showp] || [profile];
                                popp[showp] = profile[showp];
                                profile[showp].push(popp);
                            }else popp=pop.get(0);

                            //input a copy of root for group trigger
                            profile[popgrp].push(popp.getRoot()._get(0));
                            popp[popgrp] = profile[popgrp];

                            //set parent pop
                            popp.$parentPopMenu = profile;
                            profile.$childPopMenu = popp;

                            pop.pop(src, 2);
                            profile[sms] = pop;
                        }
                    }
                },
                onMouseout:function(profile, e, src){
                    var properties = profile.properties,
                        item = profile.getItemByDom(src),
                        itemId = item.id,
                        action = true,
                        hl='$highLight',
                        t;
                    if(profile[hl] == src)return;

                    //if cursor move to submenu, keep the hover face
                    if(t=profile.$subPopMenuShowed){
                        var node = e.toElement||e.relatedTarget,
                            target = t.get(0).getRootNode();
                        try{
                            do{
                                if(node==target)
                                    return;
                            }while((node && (node=node.parentNode)))
                        }catch(a){}
                    }
                    xui.use(src).tagClass('-mouseover',false);
                    profile[hl] = null;
                },
                onClick:function(profile, e, src){
                    var prop = profile.properties,
                        item = profile.getItemByDom(src),
                        itemId = item.id;
                    if(prop.disabled || item.disabled)return false;

                    // give a change to click an item with sub popmenu
                    if(!item.group){
                        if(item.type=='checkbox')
                            profile.getSubNodeByItemId('CHECKBOX',item.id).tagClass('-checked', item.value = !item.value);
                        else if(item.type=='radiobox'){
                            profile.getSubNode('RADIOBOX',true).tagClass('-checked', false);
                            _.arr.each(prop.items,function(o){
                                if(o.type=='radiobox')
                                    o.value=false;
                            });
                            profile.getSubNodeByItemId('RADIOBOX',item.id).tagClass('-checked', item.value = true);
                        }

                        if(profile.onMenuSelected)profile.boxing().onMenuSelected(profile, item, src);

                        if(prop.hideAfterClick){
                            xui.use(src).tagClass('-mouseover',false);
                            //hide all parent pop
                            _.asyRun(function(){
                                var p=profile,q;
                                if(!p.renderId)return;
                                while(p){
                                    p.boxing().hide();
                                    p=(q=p).$parentPopMenu;
                                    q.$parentPopMenu = q.$subPopMenuShowed = null;
                                }
                                //reset
                                profile.$subPopMenuShowed = null;
                                if(profile.$popGrp)
                                    profile.$popGrp.length=0;
                            },100);
                        }
                    }
                },
                onFocus:function(profile, e, src){
                    var box = profile.getSubNode('BOX'),
                        top=box.scrollTop(), h=box.scrollHeight(),
                        n = xui.use(src).offsetTop();

                    if(n<top || n>top+h)
                        xui.use(src).offsetTop(top);

                    xui.use(src).onMouseover();
                },
                onKeydown : function(profile, e, src){
                    var item = profile.getItemByDom(src),
                        items = profile.properties.items,
                        key = xui.Event.getKey(e).key,
                        itemId = item.id,
                        flag,r,tid,node,t;

                    switch(key){
                        case 'enter':
                            xui(src).onClick();
                            break;
                        case 'up':
                            r=true;
                            flag=false;
                            _.arr.each(items,function(o,i){
                                if(o.type == 'split')return;
                                if(flag){
                                    tid=o.id;
                                    return r=false;
                                }
                                if(o.id == itemId)flag=true;
                            },null,true);
                            //last
                            if(r)tid=items[items.length-1].id;
                            node = profile.getSubNodeByItemId('ITEM', tid).get(0);
                            break;
                        case 'down':
                            r=true;
                            flag=false;
                            _.arr.each(items,function(o,i){
                                if(o.type == 'split')return;
                                if(flag){
                                    tid=o.id;
                                    return r=false;
                                }
                                if(o.id == itemId)flag=true;
                            });
                            //first
                            if(r)tid=items[0].id;
                            node = profile.getSubNodeByItemId('ITEM', tid).get(0);
                            break;
                        case 'left':
                            if(t=profile.$parentPopMenu){
                                if(t=profile.$parentPopMenu.$highLight)
                                    node = t;
                            }
                            break;
                        case 'right':
                            if((t=profile.$subPopMenuShowed) && t == profile.$allPops[itemId])
                                t.activate();
                            break;
                    }
                     if(node&&node.tagName)try{node.focus()}catch(e){}
                }
            },
            TOP:{
                onMouseover:function(profile){
                    profile.$scrollToTop=true;
                    profile.boxing()._scrollToTop();
                },
                onMouseout:function(profile){
                    profile.$scrollToTop=false;
                    profile.$scrollStep=null;
                },
                onClick:function(profile){
                    profile.$scrollStep*=2;
                }
            },
            BOTTOM:{
                onMouseover:function(profile){
                    profile.$scrollTobottom=true;
                    profile.boxing()._scrollToBottom();
                },
                onMouseout:function(profile){
                    profile.$scrollTobottom=false;
                    profile.$scrollStep=null;
                },
                onClick:function(profile){
                    profile.$scrollStep*=2;
                }
            },
            ITEMS:{
                afterKeydown:function(profile, e){
                    var key=xui.Event.getKey(e).key;
                    if(key=='tab' || key=='enter')
                        return true;
                    else if(key=='esc'){
                        //top
                        do{
                            profile.boxing().hide();
                        }while(profile = profile.$parentPopMenu)

                        return false;
                    }else return false;
                }
            },
            BORDER:{
                onMouseout:function(profile, e, src){
                    profile.box._mouseout(profile, e, src);
                }
            }
        },
        DataModel:({
            dock:null,
            tabindex:null,
            tips:null,
            border:null,
            resizer:null,
            showEffects:"Blur",
            hideEffects:"",
            autoTips:false,
            shadow:true,
            _maxHeight:260,
            _maxWidth:300,
            left:-10000,

            hideAfterClick:true,

            autoHide:false,

            height:'auto',
            //opera needs more space for initialize
            width:'auto',
            position:'absolute',
            $hborder:0,
            $vborder:0
        }),
        EventHandlers:{
            onShowSubMenu:function(profile, item, src){},
            beforeHide:function(profile,e){},
            onHide:function(profile){},
            onMenuSelected:function(profile, item, src){}
        },
        RenderTrigger:function(){
            this.boxing().adjustSize();
        },
        _mouseout:function(profile, e){
            if(profile.properties.autoHide){
                var p1=xui.Event.getPos(e),
                    size, p2, b;
                _.arr.each(profile.$popGrp,function(o){
                    o=xui([o]);
                    p2=o.offset();
                    size=o.cssSize();
                    if(p1.left>p2.left && p1.top>p2.top && p1.left<p2.left+size.width && p1.top<p2.top+size.height)
                        return b=1;
                });
                if(!b){
                    while(b=profile.$parentPopMenu)profile=b;
                    profile.boxing().hide(true,null,e);
                    if(profile.$popGrp)
                        profile.$popGrp.length=0;
                }
            }
        },
        _prepareItem:function(profile, item){
            var none='display:none;';
            item.add = item.add || '';
            item.displayAdd = item.add?'':none;
            item.displaySub = item.sub?'':none;
            item._itemDisplay=item.hidden?none:'';

            item.type=item.type||'button';
            if(item.type=='checkbox')
                item.checkboxCls =profile.getClass('CHECKBOX', item.value?'-checked':'');
            else if(item.type=='radiobox')
                item.radioboxCls =profile.getClass('RADIOBOX', item.value?'-checked':'');
        },
        _onresize:null
    }
});