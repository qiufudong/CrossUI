Class("xui.UI.RichEditor", ["xui.UI","xui.absValue"],{
    Initialize:function(){
        this.addTemplateKeys(['TOOLBARBTN']);
    },
    Instance:{
        getEditorWin:function(){
            return this.get(0).$win;
        },
        getEditorDoc:function(){
            return this.get(0).$doc;
        },
        getEditorBody:function(){
            var doc=this.get(0).$doc;
            return doc && (doc.body||doc.documentElement);
        },
        _setCtrlValue:function(value){
            if(!_.isSet(value))value='';
            return this.each(function(profile){
                var sp=window['/'];
                if(sp && sp.indexOf(':/')!=-1)
                    value=value.replace(/{\/}/g,sp);
                var html=xui.adjustRes(value,0,1);
                if(!profile.$inDesign){
                    var doc=profile.$doc, body=doc && (doc.body||doc.documentElement);
                    if(body){
                        body.innerHTML=html;
                        return;
                    }
                }
                 profile.getSubNode("EDITOR").html(html);
            });
        },
        _getCtrlValue:function(){
            var profile=this.get(0);
            if(!profile.$inDesign){
                var doc=profile.$doc,
                    body=doc && (doc.body||doc.documentElement);
                 if(body){
                    var v=body.innerHTML,sp=window['/'];
                    if(sp && sp.indexOf(':/')!=-1)
                        v=v.replace(new RegExp(sp,'g'), '{/}');
                    return v;
                }else
                    return '';
            }else{
                return profile.getSubNode("EDITOR").html();
            }
        },
        //update UI face
        _setDirtyMark:function(){
            return arguments.callee.upper.apply(this,['MARK']);
        }
    },
    Static:{
        Templates:{
            tagName:'div',
            style:'{_style}',
            className:'{_className} xui-ui-selectable',
            LABEL:{
                className:'{_required}',
                style:'{labelShow};width:{labelSize}px;{labelHAlign}',
                text:'{labelCaption}'
            },
            BOX:{
                EDITOR:{
                    tagName:'div'
                },
                MARK:{
                },
                POOL:{}
            }
        },
        DataModel:{
            selectable:true,
            value:{
                ini:'',
                html:1
            },
            width:400,
            height:300,
            frameTemplate:{
                ini:'<html style="-webkit-overflow-scrolling: touch;padding:0;margin:0;">'+
                        '<head>'+
                            '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
                            '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0\">'+
                            '<style type="text/css">'+
                                'body{height: 100%;-webkit-overflow-scrolling: touch;border:0;padding:0;margin:6px;cursor:text;background:#fff;color:#000;font-family:sans-serif,Arial,Verdana,"Trebuchet MS";font-style:normal;font-weight:normal;font-size:12px;line-height:1.6}'+
                                'div, p{margin:0;padding:0;} '+
                                'body, p, div{word-wrap: break-word;} '+
                                'img, input, textarea{cursor:default;}'+
                            '</style>'+
                        '</head>'+
                        '<body scroll="auto" spellcheck="false"></body>'+
                    '</html>',
                action:function(){
                    this.boxing().refresh();
                }
            },
            frameStyle:"",
            cmdList:{
                ini:'font1;font2;align;list;font4;font3;insert;clear;html',
                action:function(v){
                    var ns=this;
                    if(!ns.properties.disabled && !ns.properties.readonly)
                        ns.box._iniToolBar(ns);
                }
            },
            cmdFilter:{
                ini:''
            },
            disabled:{
                ini:false,
                action: function(disabled){
                    var disabled=this.properties.disabled||this.properties.readonly,
                        doc=this.$doc;
                    if(doc){
                        if (doc.body.contentEditable != undefined && xui.browser.ie)
                           doc.body.contentEditable = disabled?"false":"true";
                        else
                           doc.designMode=disabled?"off":"on";
                        
                        this.box._iniToolBar(this, !disabled);
                    }
                }
            },
            readonly:{
                ini:false,
                action: function(v){
                    this.boxing().setDisabled(v);
                }
            },
           // label
            labelSize:{
                ini:0,
                action: function(v){
                    this.getSubNode('LABEL').css({display:v?'':'none',width:(v||0)+"px"});
                    xui.UI.$doResize(this,this.properties.width,this.properties.height,true);
                }
            },
            labelPos:{
                ini:"left",
                listbox:['left','top', 'right', 'bottom'],
                action: function(v){
                    xui.UI.$doResize(this,this.properties.width,this.properties.height,true);
                }                
            },
            labelGap:{
                ini:4,
                action: function(v){
                    xui.UI.$doResize(this,this.properties.width,this.properties.height,true);
                }
            },
            labelCaption:{
                ini:"",
                action: function(v){
                    v=(_.isSet(v)?v:"")+"";
                    this.getSubNode('LABEL').html(xui.adjustRes(v,true));
                }
            },
            labelHAlign:{
                ini:'right',
                listbox:['','left','center','right'],
                action: function(v){
                    this.getSubNode('LABEL').css('textAlign',v);
                }
            }
        },
        Appearances:{
            KEY:{
                overflow:"hidden"
            },
            BOX:{
                left:0,
                top:0,
                width:'100%',
                position:'absolute',
                overflow:'hidden'
            },
            POOL:{
                position:'absolute',
                display:'none'
            },
            MARK:{
                position:'absolute',
                width:"12px",
                height:"12px"
            },
            TOOLBARBTN:{
                background:xui.UI.$bg('toolbar.gif', 'no-repeat')
            },
            LABEL:{
               'z-index':1,
               top:0,
               left:0,
               position:'absolute',
               'padding-top':'4px',
               'font-size':'12px'
            },
            EDITOR:{
                position:'absolute',
                display:'block',
                left:0,
                top:0,
                width:'100%',
                height:'100%',
                padding:0,
                margin:0,
                border:'1px solid #648CB4',
                'background-color':'#fff',
                'z-index':'0'
            }
        },
        Behaviors:{
            onSize:xui.UI.$onSize,
            LABEL:{
                onClick:function(profile, e, src){
                    if(profile.properties.disabled)return false;
                    if(profile.onLabelClick)
                        profile.boxing().onLabelClick(profile, e, src);
                },
                onDblClick:function(profile, e, src){
                    if(profile.properties.disabled)return false;
                    if(profile.onLabelDblClick)
                        profile.boxing().onLabelDblClick(profile, e, src);
                },
                onMousedown:function(profile, e, src){
                    if(xui.Event.getBtn(e)!='left')return;
                    if(profile.properties.disabled)return false;
                     if(profile.onLabelActive)
                        profile.boxing().onLabelActive(profile, e, src);
                }
            }
        },
        EventHandlers:{
            onInnerEvent : function(profile, type, node, e){},
            onUpdateToolbar : function(profile, etype, doc){},
            onReady : function(profile){},
            
            onLabelClick:function(profile, e, src){},
            onLabelDblClick:function(profile, e, src){},
            onLabelActive:function(profile, e, src){}
        },
        $cmds:{
            //font style
            font1:[
                 {id:'bold',command:'Bold',statusButton:true,imagePos:"-36px 0"},
                 {id:'italic',command:'Italic',statusButton:true,imagePos:"-108px 0"},
                 {id:'underline',command:'Underline',statusButton:true,imagePos:"-324px 0"},
                 {id:'strikethrough',command:'strikeThrough',statusButton:true,imagePos:"-252px 0"}
            ],
            font2:[
                {id:'subscript',command : 'subscript',statusButton:true,imagePos:"-270px 0"},
                {id:'superscript',command : 'superscript',statusButton:true,imagePos:"-288px 0"}
            ],
            font3:[
                {id:'forecolor',command:'custom',imagePos:"0 0"},
                {id:'bgcolor',command:'custom',imagePos:"-18px 0"}
            ],
            font4:[
                {id:'fontsize',command:'custom',caption:'$editor.fontsize',dropButton:true},
                {id:'fontname',command:'custom',caption:'$editor.fontname',dropButton:true},
                {id:'formatblock',command:'custom',caption:'$editor.formatblock',dropButton:true}
            ],
            align:[
                {id:'left',command:'justifyleft',imagePos:"-144px 0"},
                {id:'center',command:'justifycenter',imagePos:"-54px 0"},
                {id:'right',command:'justifyright',imagePos:"-216px 0"},
                {id :'justify', command : 'justifyfull',imagePos:"-126px 0"}
            ],
            list:[
                {id:'indent', command:'indent',imagePos:"-90px 0"},
                {id:'outdent',command:'outdent',imagePos:"-180px 0"},
                {id:'ol',command:'insertorderedlist',imagePos:"-162px 0"},
                {id:'ul',command:'insertunorderedlist',imagePos:"-306px 0"}
            ],
            insert:[
                {id:'hr',command:'insertHorizontalRule',imagePos:"-72px 0"},
                {id:'insertimage',command:'custom',imagePos:"-342px 0"},
                {id:'createlink',command:'custom',imagePos:"-360px 0"},
                {id:'unlink',command:'unlink',imagePos:"-378px 0"}
            ],
            clear:[
                {id:'removeformat',command:'removeformat',imagePos:"-198px 0"}
            ],
            html:[
                {id:'html',command:'custom', imagePos:"-234px 0"}
            ]
        },
        _prepareData:function(profile){
            var d=arguments.callee.upper.call(this, profile);            
            d.labelHAlign=d.labelHAlign?("text-align:" + d.labelHAlign):"";
            d.labelShow=d.labelSize?"":("display:none");
            // adjustRes for labelCaption
            if(d.labelCaption)
                d.labelCaption=xui.adjustRes(d.labelCaption,true);
            return d;
        },
        _updateToolbar:function(domId, clear,etype){
            var profile=xui.$cache.profileMap[domId],toolbar;
            if(!profile)return;

            if(profile.properties.disabled || profile.properties.readonly)return;

            if(profile && (toolbar=profile.$toolbar)){
                var doc=profile.$doc,
                    bold=clear?false:doc.queryCommandState('bold'),
                    italic=clear?false:doc.queryCommandState('italic'),
                    underline=clear?false:doc.queryCommandState('underline'),
                    strikethrough=clear?false:doc.queryCommandState('strikethrough'),
                    subscript=clear?false:doc.queryCommandState('subscript'),
                    superscript=clear?false:doc.queryCommandState('superscript'),

                    tb=toolbar.boxing();

                tb.updateItem('bold',{value:bold})
                tb.updateItem('italic', {value:italic})
                tb.updateItem('underline', {value:underline})
                tb.updateItem('strikethrough', {value:strikethrough})
                tb.updateItem('subscript', {value:subscript})
                tb.updateItem('superscript', {value:superscript})

                if(profile.onUpdateToolbar){
                    profile.boxing().onUpdateToolbar(profile, etype, doc);
                }
                doc=null;
            }
        },
        RenderTrigger:function(){
            var self=this;

            if(!self.properties.disabled && !self.properties.readonly)
                self.box._iniToolBar(self);

            if(!self.$inDesign){
                var div=self.getSubNode('EDITOR').get(0),
                    domId=self.$domId,
                    htmlTpl=self.properties.frameTemplate,
                    style=self.properties.frameStyle,
                    id=div.id;
                if(style){
                    htmlTpl = htmlTpl.replace(/<\s*\/\s*head\s*>/,"<style>" + (style||"") + "</style></head>");
                }
                // rendered already
                if(!self.$once){
                    self.$once=true;
                    try{
                        var iframe = self.$ifr=document.createElement("IFRAME");
                    }catch(e){
                        var iframe = self.$ifr=document.createElement("<iframe name='"+id+"' id='"+id+"'></iframe>");
                    }
                    //_updateToolbar event
                    var kprf=this,
                        eventOutput =self._eventOutput=function(e){
                            if(kprf && (kprf.properties.disabled||kprf.properties.readonly))return;
                            if(kprf.onInnerEvent)
                                return kprf.boxing().onInnerEvent(kprf, e.type, xui.Event.getSrc(e), e);
                        },
                        event=self._event=function(e){
                            if(kprf && (kprf.properties.disabled||kprf.properties.readonly))return;
    
                            if(e.type !== "mouseover" && e.type !== "mouseout"){
                                _.resetRun('RichEditor:'+domId, function(){
                                    // destroyed
                                    if(!kprf.box)return;
                                    xui.UI.RichEditor._updateToolbar(domId, false,e.type)
                                },100);
                                 if(e.type=='mousedown'){
                                    if(xui.browser.applewebkit && e.target.tagName=="IMG"){
                                            var sel = self.$win.getSelection(), range = self.$doc.createRange();
                                            range.selectNode(e.target);
                                            sel.removeAllRanges();
                                            sel.addRange(range);
                                    }

                                    //for BlurTrigger
                                    xui.doc.onMousedown(true);
                                 }  
                            }
                            if(kprf.onInnerEvent)
                                return kprf.boxing().onInnerEvent(kprf, e.type, xui.Event.getSrc(e), e);
                        },
                        event2=self._event2=function(e){
                            if(kprf && (kprf.properties.disabled||kprf.properties.readonly))return;
                            if(kprf.onInnerEvent){
                                _.resetRun(kprf.$xid+":frmInnerAsyEvent", function(){
                                    if(kprf && !kprf.destroyed)
                                        kprf.boxing().onInnerEvent(kprf, e.type, xui.Event.getSrc(e), e);
                                });
                            }
                        },
                        _focus=function(e){
                            if(!kprf)return;
                            if(kprf.properties.disabled||kprf.properties.readonly)return;
                            kprf.box._onchange(kprf);
                        },
                        _blur=function(e){
                            if(!kprf)return;
                            if(kprf.properties.disabled||kprf.properties.readonly)return;
                            
                            _.resetRun('RichEditor:'+domId, function(){
                                // destroyed
                                if(!kprf.box)return;
                                xui.UI.RichEditor._updateToolbar(domId, true, 'blur')
                            },100);

                            if(kprf._onchangethread){
                                clearInterval(kprf._onchangethread);
                                kprf._onchangethread=null;
                                // check again
                                if(kprf && kprf.box)
                                    kprf.box._checkc(kprf);
                            }
                            
                            var v=kprf.boxing()._getCtrlValue(); 
                            // here: dont trigger setCtrlValue
                            kprf.boxing().setUIValue(v,null,true,'blur');
                        },
                        gekfix=function(e){
                            // to fix firefox appendChid's bug: refresh iframe's document
                            if(kprf){
                                var ins=kprf.boxing();
                                _.asyRun(function(){
                                    // destroyed
                                    if(!kprf.box)return;
                                    ins.refresh(); 
                                });
                            }
                        },
                        doc,win,
                        checkF = function(){
                            _.setTimeout(function(){
                                // removed from DOM already
                                if(!frames[id])return;
                                // not ready
                                if(!frames[id].document)return;
                                
                                if(self.$win!=frames[id].window){
                                    win=self.$win=frames[id].window;
    
                                    doc=self.$doc=win.document;
                                    
                                    doc.open();
                                    doc.write(htmlTpl);
                                    doc.close();
                                    
                                    //if(xui.browser.isTouch && (xui.browser.isAndroid||||xui.browser.isBB)){
                                    //    xui(doc.body).$touchscroll('xy');
                                    //}
        
                                    try{doc.execCommand("styleWithCSS", 0, false)}catch(e){
                                        try {doc.execCommand("useCSS", 0, true)}catch(e){}
                                    }
        
                                    var disabled=self.properties.disabled||self.properties.readonly;
        
                                    if (doc.body.contentEditable != undefined && xui.browser.ie)
                                       doc.body.contentEditable = disabled?"false":"true";
                                    else
                                       doc.designMode=disabled?"off":"on";
                                    
                                    // ensure toolbar disable
                                    if(disabled){
                                        self.box._iniToolBar(self, false);
                                    }
        
                                    win._gekfix=gekfix;
        
                                    if(xui.browser.ie && doc.attachEvent){
                                        doc.attachEvent("unload",gekfix);
        
                                        if(!disabled){
                                            doc.attachEvent("onmousedown",event);
                                            doc.attachEvent("ondblclick",event);
                                            doc.attachEvent("onclick",event);
                                            doc.attachEvent("oncontextmenu",eventOutput);
                                            doc.attachEvent("onkeyup",event);
                                            doc.attachEvent("onkeydown",event);
                                            
                                            doc.attachEvent("onmouseover",event);
                                            doc.attachEvent("onmouseout",event);
                                            doc.attachEvent("onmousemove",event2);
                                            
                                            win.attachEvent("onfocus",_focus);
                                            win.attachEvent("onblur",_blur);
                                            (self.$beforeDestroy=(self.$beforeDestroy||{}))["ifmClearMem"]=function(){
                                                var win=this.$win,
                                                    doc=this.$doc,
                                                    event=this._event,
                                                    event2=this._event2;
                                                if(this._onchangethread){
                                                    clearInterval(this._onchangethread);
                                                    this._onchangethread=null;
                                                }
    
                                                // crack for ie7/8 eat focus
                                                // error raise in ie6
                                                try{
                                                    var status=doc.designMode;
                                                    doc.designMode="off";
                                                    doc.designMode="on";
                                                    doc.designMode=status;
                                                }catch(e){}
    
                                                win._gekfix=undefined;
    
                                                try{doc.detachEvent("unload",win._gekfix);}catch(e){}
    
                                                if(!this.properties.disabled && !this.properties.readonly){
                                                    doc.detachEvent("onmousedown",event);
                                                    doc.detachEvent("ondblclick",event);
                                                    doc.detachEvent("onclick",event);
                                                    doc.detachEvent("oncontextmenu",eventOutput);
                                                    doc.detachEvent("onkeyup",event);
                                                    doc.detachEvent("onkeydown",event);

                                                    doc.detachEvent("onmouseover",event);
                                                    doc.detachEvent("onmouseout",event);
                                                    doc.detachEvent("onmousemove",event2);

                                                    win.detachEvent("onfocus",_focus);
                                                    win.detachEvent("onblur",_blur);
                                                }
                                                win=doc=event=event2=null;
                                            };
                                        }
                                    }else{
                                        var prf=self;
                                        // for opera
                                        if(xui.browser.opr || !win.addEventListener){
                                            prf.$repeatT=xui.Thread.repeat(function(){
                                                if(!frames[id])
                                                    return false;
                                                else{
                                                    if(!prf.$win.document || !prf.$win.document.defaultView)
                                                        prf.boxing().refresh(); 
                                                }
                                            }, 99);
                                        }else
                                            win.addEventListener("unload",gekfix,false);
    
                                        if(!disabled){
                                            doc.addEventListener("mousedown",event,false);
                                            doc.addEventListener("dblclick",event,false);
                                            doc.addEventListener("click",event,false);
                                            doc.addEventListener("contextmenu",eventOutput,false);
                                            doc.addEventListener("keyup",event,false);

                                            doc.addEventListener("mouseover",event,false);
                                            doc.addEventListener("mouseout",event,false);
                                            doc.addEventListener("mousemove",event2,false);

                                            if(xui.browser.gek || !win.addEventListener){
                                                doc.addEventListener("focus",_focus,false);
                                                doc.addEventListener("blur",_blur,false);
                                                doc.addEventListener("keypress",event,false);
                                            }else{
                                                win.addEventListener("focus",_focus,false);
                                                win.addEventListener("blur",_blur,false);
                                                doc.addEventListener("keydown",event,false);
                                            }
                                        }
        
                                        //don't ues $ondestory, opera will set doc to null
                                        (self.$beforeDestroy=(self.$beforeDestroy||{}))["ifmClearMem"]=function(){
                                            var win=this.$win,
                                                doc=this.$doc,
                                                ifr=this.$ifr,
                                                event=this._event,
                                                event2=this._event2;
                                            // for opera
                                            if(xui.browser.opr)
                                                if(prf.$repeatT)prf.$repeatT.abort();
                                            
                                            if(ifr.detachEvent){
                                                ifr.detachEvent('onload',checkF);
                                            }else{
                                                ifr.onload=null;
                                            }
    
                                            try{win.removeEventListener("unload",win._gekfix,false);}catch(e){}
    
                                            win._gekfix=undefined;
        
                                            //for firefox
                                            delete frames[this.$frameId];
        
                                            if(!this.properties.disabled && !this.properties.readonly && doc.removeEventListener){
                                                doc.removeEventListener("mousedown",event,false);
                                                doc.removeEventListener("dblclick",event,false);
                                                doc.removeEventListener("click",event,false);
                                                doc.removeEventListener("contextmenu",eventOutput,false);
                                                doc.removeEventListener("keyup",event,false);

                                                doc.removeEventListener("mouseover",event,false);
                                                doc.removeEventListener("mouseout",event,false);
                                                doc.removeEventListener("mousemove",event2,false);

                                                if(xui.browser.gek || !win.removeEventListener){
                                                    doc.removeEventListener("focus",_focus,false);
                                                    doc.removeEventListener("blur",_blur,false);
                                                    doc.removeEventListener("keypress",event,false);
                                                }else{
                                                    win.removeEventListener("focus",_focus,false);
                                                    win.removeEventListener("blur",_blur,false);
                                                    doc.removeEventListener("keydown",event,false);
                                                }
                                            }
                                            prf=gekfix=event=event2=win=doc=null;
                                        };
                                    }
                                    
                                    self.boxing()._setCtrlValue(self.properties.$UIvalue||"");
                                    
                                    iframe.style.visibility='';
                                    iframe.style.overflow='auto';

                                    if(self.onReady)self.boxing().onReady(self);
                                }
                            });
                        };
                    self.$frameId=id;
                    iframe.id=iframe.name=id;
                    iframe.className=div.className;
                    iframe.src="about:blank";
                    iframe.frameBorder=0;
                    iframe.border=0;
                    iframe.scrolling='yes';
                    iframe.marginWidth=0;
                    iframe.marginHeight=0;
                    iframe.tabIndex=-1;
                    iframe.allowTransparency="allowtransparency";
                    iframe.style.visibility='hidden';
                    
                    //replace the original one
                    xui.$cache.domPurgeData[iframe.$xid=div.$xid].element=iframe;
                    div.parentNode.replaceChild(iframe,div);

                    if(iframe.attachEvent){
                        iframe.attachEvent('onload',checkF);
                    }else{
                        iframe.onload=checkF;
                    }
                }
            }else{
                 self.boxing()._setCtrlValue(self.properties.value||"");
            }
        },
        _checkc:function(profile){
            if(profile && profile.$doc){
                var doc=profile.$doc, body=doc && (doc.body||doc.documentElement);
                if(!profile.__oldv)
                    profile.__oldv=body.innerHTML;
                if(body.innerHTML!=profile.__oldv){
                    var ov=profile.__oldv;
                    profile.__oldv=body.innerHTML;
                    profile.boxing().onChange(profile,ov,body.innerHTML);
                }
            }
        },
        _onchange:function(profile){
            if(profile.onChange){
                if(profile._onchangethread){
                    clearInterval(profile._onchangethread);
                    profile._onchangethread=null;
                }
                profile._onchangethread=setInterval(function(){
                    if(profile && profile.box)
                        profile.box._checkc(profile);
                }, 500);
            }
        },
        _clearPool:function(profile){
            profile.getSubNode('POOL').empty();
            profile.$colorPicker=profile.$fontsizeList=profile.$fontnameList=profile.$formatblockList=profile.$htmlEditor=null;
        },
        _iniToolBar:function(profile, flag){
            var self=profile,
                pro=self.properties,
                cmdFilter=(pro.cmdFilter||'').split(/[\s,;]+/),
                tbH;
            if(self.$toolbar){
                self.$toolbar.boxing().destroy(true);
                delete self._$tb;
                delete self.$toolbar;
            }

            if(flag!==false){
                var t,v,o,items=[],
                    imageClass=self.getClass('TOOLBARBTN'),
                    arr=pro.cmdList.split(/[\s,;]+/),
                    h={};
                _.arr.each(arr,function(i){
                    //filter
                    if((o=self.box.$cmds[i]) && !h[i]){
                        h[i]=1;
                        _.filter(o,function(v){
                            if(_.arr.indexOf(cmdFilter,v.id)!==-1)return false;
                            if(v.imagePos)
                                v.imageClass=imageClass;
                            v.tips=xui.wrapRes('editor.'+v.id);
                        });
                        items.push({id:i,sub:o});
                    }
                });
    
                //compose
                self.getSubNode('BOX').prepend(
                    t=new xui.UI.ToolBar({selectable:false,handler:false,items:items,disabled:pro.disabled||pro.readonly})
                );
                t.render(true);
                // keep toolbar's height number here
                profile.$_tbH=tbH=t.getRoot().height();

                if(xui.browser.ie)
                    t.getSubNode('BOX').query('*').attr('unselectable','on');

                t = self._$tb = t.get(0);
    
                t.onClick=self.box._toolbarclick;
                v=self._$composed={};
                v[t.$xid]=t;
                self.$toolbar=t;
                t.$hostage=self;
            }
            xui.UI.$tryResize(profile, pro.width, pro.height,true);
            return tbH;
        },
        _toolbarclick:function(profile,item,group,e,src){
            var editor=profile.$hostage;
            if(!editor.$doc)return;

            var pro=editor.properties, first;
            editor.$win.focus();

            if(item.command=='custom'){
                var cmd=item.id,
                    o,_clear,node,
                    items, items2;

                //get the pop control
                switch(cmd){
                    case 'forecolor':
                    case 'bgcolor':
                        if(!editor.$colorPicker){
                            first=true;
                            editor.$colorPicker=(new xui.UI.ColorPicker({selectable:false,barDisplay:false})).render(true);
                        }
                        o=editor.$colorPicker;
                        break;
                    case 'fontsize':
                    case 'fontname':
                    case 'formatblock':
                        //if lang was changed, clear the pool first
                        if(editor.$lang!=xui.getLang())
                            editor.box._clearPool(editor);
                        editor.$lang=xui.getLang();

                        //font size
                        if(cmd=='fontsize'){
                            if(!editor.$fontsizeList){
                                items = xui.getRes('editor.fontsizeList');
                                items = items.split(';');
                                items2=[];
                                var t;
                                _.arr.each(items,function(o){
                                    o=o.split(',');
                                    t=o[0]=='...'?'1':o[0];
                                    items2.push({id:o[0], caption:'<font size="'+o[0]+'" '+xui.$IEUNSELECTABLE()+'>'+o[1]+'</font>'});
                                });
                                first=true;
                                editor.$fontsizeList=(new xui.UI.List({selectable:false,height:'auto',items:items2,width:150})).render(true);
                            }
                            o=editor.$fontsizeList;
                        //font family
                        }else if(cmd=='fontname'){
                            if(!editor.$fontnameList){
                                items = xui.getRes('editor.fontnameList');
                                items = items.split(';');
                                items2=[];
                                var t;
                                _.arr.each(items,function(o){
                                    t=o=='...'?'':o;
                                    items2.push({id:o, caption:'<span style="font-family:'+o+'" '+xui.$IEUNSELECTABLE()+'>'+o+'</span>'});
                                });
                                first=true;
                                editor.$fontnameList=(new xui.UI.List({selectable:false,height:'auto',items:items2})).render(true);
                            }
                            o=editor.$fontnameList;
                        //font format
                        }else if(cmd=='formatblock'){
                            if(!editor.$formatblockList){
                                items = xui.getRes('editor.formatblockList');
                                items = items.split(';');
                                items2=[];
                                var t;
                                _.arr.each(items,function(o){
                                    o=o.split(',');
                                    t=o[0]=='...'?'span':o[0];
                                    items2.push({id:o[0], caption:'<'+t+' style="display:inline;padding:0;margin:0" '+xui.$IEUNSELECTABLE()+'>'+o[1]+'</'+t+'>'});
                                });
                                first=true;
                                editor.$formatblockList=(new xui.UI.List({selectable:false,height:'auto',items:items2})).render(true);
                            }
                            o=editor.$formatblockList;
                        }
                        break;
                    case 'html':
                        if(!editor.$htmlEditor){
                            first=true;
                            editor.$htmlEditor=new xui.UI.Input({multiLines:true,width:400,height:300,resizer:true});
                        }
                        o=editor.$htmlEditor;
                        break;
                }
                //pop the control and set clear funciton
                if(o){
                    _clear=function(){
                        o.beforeUIValueSet(null);
                        editor.getSubNode('POOL').append(o.getRoot());
                        node.setBlurTrigger(editor.$xid);
                        xui.Event.keyboardHook('esc');
                        _.asyRun(function(){
                            // destroyed
                            if(!editor||!editor.$win)return;
                            editor.$win.focus()
                        });
                    };

                    o.setValue('',true,'clear');
                    node=o.reBoxing();

                    if(editor.$htmlEditor==o){
                        var root=editor.getRoot(),ifr=editor.getSubNode("EDITOR");
                        o.setLeft(ifr.left()).setTop(ifr.top()).setWidth(ifr.offsetWidth()).setHeight(ifr.offsetHeight());
                        o.setZIndex(10);
                        root.append(node);
                    }else{
                        node.popToTop(src);
                    }

                    if(first && xui.browser.ie)
                        o.getSubNode('BOX').query('*').attr('unselectable','on');
                    
                    _.tryF(o.activate,[],o);

                    //for on blur disappear
                    node.setBlurTrigger(editor.$xid, function(){
                        //force to trigger beforeUIValueSet event
                        if(o==editor.$htmlEditor)
                            var v=o._getCtrlValue(); 
                        // here: dont trigger setCtrlValue
                            o.setUIValue(v,null,true,'blur');
                         _clear();
                    });
                    //for esc
                    xui.Event.keyboardHook('esc',0,0,0,function(){
                        _clear();
                    },null,null,profile.domId);
                }
                //set beforeUIValueSet function
                switch(cmd){
                    case 'forecolor':
                    case 'bgcolor':
                        o.beforeUIValueSet(function(p,o,v){
                            _clear();
                            var doc=editor.$doc;
                            if(cmd=='bgcolor' && xui.browser.gek){
                                doc.execCommand('useCSS',0,false);
                                doc.execCommand('hilitecolor',false, '#'+v);
                                doc.execCommand('useCSS',0,true);
                            }else{
                                if(cmd=='bgcolor')
                                    cmd=xui.browser.opr?'hilitecolor':'backcolor';
                                doc.execCommand(cmd,false, xui.browser.kde?('#'+v):v)  ;
                            }
                            doc=null;
                            return false;
                        });
                        break;
                    case 'fontsize':
                    case 'fontname':
                    case 'formatblock':
                        o.beforeUIValueSet(function(p,o,v){
                            _clear();
                            //store range for IE
                            if(xui.browser.ie && (v=='...' ||cmd=='formatblock' )){
                                var selection=editor.$doc.selection,
                                    range=selection?selection.createRange():null;
                                if(range && range.parentElement().ownerDocument!=editor.$doc)
                                    range=selection=null;
                            }
                            var f=function(cmd,v){
                                    var doc=editor.$doc;

                                    //for formatblock in IE
                                    //reset range for IE
                                    if(range){
                                        editor.$win.focus();
                                        if(cmd=='formatblock' && v){
                                            var p=range.parentElement(),html;
                                            if(p.ownerDocument==doc){
                                                if(/^\s*</.test(range.htmlText)){
                                                    //affect the first block only
                                                    range.collapse(true);
                                                    p=range.parentElement();
                                                    if(p.tagName=='BODY'){
                                                        html=p.innerHTML;
                                                        p.innerHTML = "<"+v+">"+html+"</"+v+">"
                                                    }else{
                                                        html=p.outerHTML;
                                                        html=html.replace(/\<[\w]+/,'<'+v).replace(/[\w]+\>$/,v+'>');
                                                        p.outerHTML=html;
                                                    }
                                                }else{
                                                    range.pasteHTML("<"+v+">"+range.htmlText+"</"+v+">")
                                                }
                                            }
                                            p=null;
                                        }
                                        range.select();
                                        selection=range=null;
                                    }

                                    doc.execCommand(cmd,false,v);
                                    doc=null;
                                };
                            if(v=='...'){
                                var str=xui.getRes('editor.'+cmd);
                                xui.UI.Dialog.prompt(str,str,"",function(v){
                                    if(v){
                                        f(cmd,v);
                                    }
                                },function(){
                                    //reset range for IE
                                    if(xui.browser.ie){
                                        if(range){
                                            editor.$win.focus();
                                            range.select();
                                        }
                                        selection=range=null
                                    }
                                });
                            }else
                                f(cmd,v);
                        });
                        break;
                    case 'insertimage':
                    case 'createlink':
                        var str=xui.getRes('editor.'+cmd),
                            str2=xui.getRes('editor.'+cmd+'2');
                        //store range for IE
                        if(xui.browser.ie){
                            var selection=editor.$doc.selection,
                                range=selection?selection.createRange():null;
                                if(range && range.parentElement().ownerDocument!=editor.$doc)
                                    range=selection=null;
                        }
                        xui.UI.Dialog.prompt(str,str2,"http:/"+'/',function(v){
                            //reset range for IE
                            if(xui.browser.ie){
                                if(range){
                                    editor.$win.focus();
                                    range.select();
                                }
                                selection=range=null
                            }
                            if(v){
                                var doc=editor.$doc;
                                doc.execCommand(cmd,false,xui.adjustRes(v,0,1));
                                doc=null;
                            }
                        },function(){
                            //reset range for IE
                            if(xui.browser.ie){
                                if(range){
                                    editor.$win.focus();
                                    range.select();
                                }
                                selection=range=null
                            }
                        });
                        break;
                     case 'html':
                         var v=editor.boxing().getUIValue();
                         if(xui.Coder)v=xui.Coder.formatText(v,'html');
                         o.setValue(v,true,'editor');
                         o.beforeUIValueSet(function(p,o,v){
                            _clear();
                            // here: trigger setCtrlValue
                            editor.boxing().setUIValue(v,null,null,'html');
                        });
                        break;
                }
            }else{
                editor.$doc.execCommand(item.command,false,item.commandArgs);

                if(item.id=='removeformat')
                    xui.UI.RichEditor._updateToolbar(editor.$domId,true,'none')
            }
        },
        _ensureValue:function(profile, value){
            var p=xui.$getGhostDiv();
            p.innerHTML=(_.isSet(value)?value:'')+"";
            value=p.innerHTML;
            p.innerHTML="";
            return value;
        },
        _onresize:function(profile,width,height){
            if(width || height){
                if(!height)
                    height=profile.properties.height;

                var size={},
                    _top=0,
                    t = profile.properties,

                    o = profile.getSubNode('BOX'),
                    label = profile.getSubNode('LABEL'),

                    labelSize=t.labelSize||0,
                    labelGap=t.labelGap||0,
                    labelPos=t.labelPos || 'left',
                    ll, tt, ww, hh;

                o.cssRegion({
                    left : ll = labelPos=='left'?labelSize:0,
                    top : tt = labelPos=='top'?labelSize:0,
                    width : ww = width===null?null:Math.max(0,(width - ((labelPos=='left'||labelPos=='right')?labelSize:0))),
                    height : hh = height===null?null:Math.max(0,(height - ((labelPos=='top'||labelPos=='bottom')?labelSize:0)))
                });
                if(labelSize)
                    label.cssRegion({
                        left: width===null?null:Math.max(0,labelPos=='right'?(width-labelSize+labelGap):0),
                        top:  height===null?null:Math.max(0,labelPos=='bottom'?(height-labelSize+labelGap):0), 
                        width: width===null?null:Math.max(0,((labelPos=='left'||labelPos=='right')?(labelSize-labelGap):width)),
                        height: height===null?null:Math.max(0,((labelPos=='top'||labelPos=='bottom')?(labelSize-labelGap):height))
                    });

                // calculate toolbar's height
                var itb=profile._$tb,tbh;
                if(itb){
                    // here, do resize first
                    itb.getRoot().width(ww);
                    tbh=itb.getRoot().height();
                    if(tbh)
                        profile.$_tbH=tbh;
                    else
                        tbh=profile.$_tbH;
                }
                _top=(itb?(tbh-1):0);
                
                size.height=hh - _top -2;
                if(ww) size.width = ww - 2;

                if(size.width<0)size.width=0;
                if(size.height<0)size.height=0;

                if(ww||hh){
                    if(profile&&profile.renderId){
                        profile.getSubNode('EDITOR').top(_top).cssSize(size,true);
                        profile.getSubNode('MARK').left(1).top(_top+1);
                    }
                }
            }
        }
    }
});

