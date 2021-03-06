Class("xui.DataBinder","xui.absObj",{
    Instance:{
        _ini:function(properties, events, host){
            var self=this,
                c=self.constructor,
                profile,
                options,
                np=c._namePool,
                alias,temp;
            if(properties && properties['xui.Profile']){
                profile=properties;
                alias = profile.alias || c.pickAlias();
            }else{
                if(properties && properties.key && xui.absBox.$type[properties.key]){
                    options=properties;
                    properties=null;
                    alias = options.alias;
                    alias = (alias&&!np[alias])?alias:c.pickAlias();
                }else
                    alias = c.pickAlias();
                profile=new xui.Profile(host,self.$key,alias,c,properties,events, options);
            }
            np[alias]=1;
            profile._n=profile._n||[];

            for(var i in (temp=c.$DataStruct))
                if(!(i in profile.properties))
                    profile.properties[i]=typeof temp[i]=='object'?_.copy(temp[i]):temp[i];

            //set anti-links
            profile.link(c._cache,'self').link(xui._pool,'xui');

            self._nodes.push(profile);
            profile.Instace=self;
            self.n0=profile;

            if(!profile.name)self.setName(alias);

            return self;
        },
        destroy:function(){
            this.each(function(profile){
                var box=profile.box,name=profile.properties.name;
                //unlink
                _.arr.each(profile._n, function(v){if(v)box._unBind(name,v)});
                //delete from pool
                delete box._pool[name];
                //free profile
                profile.__gc();
            });
        },
        setHost:function(value, alias){
            var self=this;
            if(value && alias)
                self.setName(alias);
            return arguments.callee.upper.apply(self,arguments);
        },

        isDirtied:function(){
            var elems=this.constructor._getBoundElems(this.get(0));
            for(var i=0,l=elems.length;i<l;i++){
                var profile=elems[i],ins;
                if(profile.box["xui.absValue"]){
                    ins = profile.boxing();
                    if((ins.getUIValue()+" ")!==(ins.getValue()+" ")){
                        return true;
                    }
                }
            }
            return false;
        },
        checkValid:function(ignoreAlert){
            var result=true;
            xui.absValue.pack(this.constructor._getBoundElems(this.get(0)),false).each(function(prf){
                if(!prf.boxing().checkValid()){
                    if(!ignoreAlert){
                        if(!prf.beforeInputAlert || false!==prf.boxing().prf.beforeInputAlert(profile, prf, 'invalid')){
                            xui.alert('$inline.invalid',xui.getRes('$inline.invalid') + (prf.properties.labelCaption?(" : " +prf.properties.labelCaption):"")  , function(){
                                if(prf&&prf.renderId)
                                       prf.boxing().activate();
                            });
                        }
                        return result=false;
                    }
                     result=false;
                }
            });
            return result;
        },
        checkRequired:function(ignoreAlert){
            var result = true;
            xui.absValue.pack(this.constructor._getBoundElems(this.get(0)),false).each(function(prf){
                if(prf.properties.required && (!(i=prf.boxing().getUIValue())) && i!==0){
                    if(!ignoreAlert){
                        if(!prf.beforeInputAlert || false!==prf.boxing().prf.beforeInputAlert(profile, prf, 'required')){
                            xui.alert('$inline.required',xui.getRes('$inline.required') + (prf.properties.labelCaption?(" : " +prf.properties.labelCaption):"")  , function(){
                                if(prf&&prf.renderId)
                                       prf.boxing().activate();
                            });
                        }
                        return result=false;
                    }
                    result=false;
                }
            });
            return result;
        },

        // for UI Controls
        getUI:function(key){
            var r;
            if(!key)
                r=xui.UI.pack(this.constructor._getBoundElems(this.get(0)),false);
            else
                _.arr.each(this.constructor._getBoundElems(this.get(0)),function(profile){
                    var p=profile.properties;
                    if((p.dataField||p.name||profile.alias)==key){
                        r=profile.boxing();
                        return false;
                    }
                });
            return r;
        },
        getUIValue:function(withCaption, dirtied){
            var ns=this,
                prf=ns.get(0),
                hash={};
            _.arr.each(this.constructor._getBoundElems(prf),function(profile){
                if(!profile.box["xui.absValue"])return;
                var p=profile.properties,
                    b = profile.boxing(),
                    // maybe return array
                    uv = b.getUIValue();
                // v and uv can be object(Date,Number)
                if(!dirtied || (uv+" ")!==(b.getValue()+" ")){
                    if(withCaption && b.getCaption){
                        hash[p.dataField || p.name || profile.alias]={value:uv,caption:b.getCaption()};
                    }else{
                        hash[p.dataField || p.name || profile.alias]=uv;
                    }
                }
            });
            return hash;
        },
        // get dirtied UI Value
        getDirtied:function(withCaption){
            return this.getUIValue(withCaption, true);
        },
        getData:function(key, force, ignoreAlert){
            var prf=this.get(0);
            // refresh
            if(prf.$inDesign || force){
                prf.properties.data=  {};
                this.updateDataFromUI(false,false,false,null,null,ignoreAlert,false);
            }

            var data=prf.properties.data;
            return _.isSet(key)?data[key]:data;
        },
        setData:function(key,value, force){
            var prf=this.get(0), prop=prf.properties;

            //clear data
            if(key===false){
                _.each(prop.data,function(o,i){
                    prop.data[i]=null;
                });
            }
            // reset all data
            else if(!_.isSet(key))
                prop.data={};
            // reset all data
            else if(_.isHash(key))
                prop.data=key;
            // reset one
            else
                prop.data[key]=value;

            if(prf.$inDesign || force){
                this.updateDataToUI();
            }
            return this;
        },
        updateValue:function(){
            xui.absValue.pack(this.constructor._getBoundElems(this.get(0)),false).updateValue();
            return this;
        },
        updateDataFromUI:function(updateUIValue,withCaption,returnArr,adjustData,dataKeys,ignoreAlert,ignoreEvent){
            var ns=this,
                prf=ns.get(0),
                prop=prf.properties,
                map={},
                mapb;
            if(!ignoreAlert){
                // check valid first
                if(!ns.checkValid()){
                    return;
                }
                // and check required
                if(!ns.checkRequired()){
                    return;
                }
            }
            _.merge(map,prop.data,function(v,t){
                return !dataKeys || dataKeys===t || (_.isArr(dataKeys)?_.arr.indexOf(dataKeys,t)!=-1:false);
            });
            _.arr.each(ns.constructor._getBoundElems(prf),function(profile){
                var p=profile.properties,
                      eh=profile.box.$EventHandlers,
                      t=p.dataField || p.name || profile.alias;
                if(!dataKeys || dataKeys===t || (_.isArr(dataKeys)?_.arr.indexOf(dataKeys,t)!=-1:false)){
                    var b = profile.boxing(),cap,
                        // for absValue, maybe return array
                        uv = profile.box['xui.absValue']?b.getUIValue(_.isBool(returnArr)?returnArr:profile.__returnArray):null;
                    // v and uv can be object(Date,Number)
                    if(_.isHash(map[t])){
                        var pp=map[t].properties,theme=map[t].theme,cc=map[t].CC,ca=map[t].CA,cs=map[t].CS;

                        if(pp)delete map[t].properties;
                        if(theme)delete map[t].theme;
                        if(ca)delete map[t].CA;
                        if(cc)delete map[t].CC;
                        if(cs)delete map[t].CS;
                        // remove non-properties
                        _.filter(map[t],function(o,i){
                            return !!(i in p);
                        });
                        // reset
                        if(!_.isEmpty(map[t])){
                            _.each(map[t],function(o,i){
                                if(i in p)map[t][i]=p[i];
                            });
                        }
                        // reset pp
                        if(_.isHash(pp)){
                            _.filter(pp,function(o,i){
                                return i in p && !(i in map[t]);
                            });
                            if(!_.isEmpty(pp)){
                                _.each(pp,function(o,i){
                                    if(i in p)pp[i]=p[i];
                                });                         
                                map[t].properties=pp
                            }
                        }
                         if(theme)map[t].theme=profile.theme;
                        if(ca)map[t].CA=_.clone(profile.CA,true);
                        if(cc)map[t].CC=_.clone(profile.CC,true);
                        if(cs)map[t].CS=_.clone(profile.CS,true);
                        if('caption' in p &&('caption' in map[t] || withCaption)&& b.getCaption)
                            if(pp&&'caption' in pp)pp.caption=b.getCaption();else map[t].caption=b.getCaption();
                        if(_.isSet(uv) && 'value' in p)
                            if(pp&&'value' in pp)pp.value=uv;else map[t].value=uv;
                    }else{
                        if(profile.box['xui.UI.ComboInput'] && (p.type=='file'||p.type=='upload')){
                            map[t]=profile;
                        }else if(withCaption && 'caption' in p){
                            cap=typeof(b.getCaption)=="function"?b.getCaption():p.caption;
                            // igore unnecessary caption
                            if((!cap && !uv) || cap==uv)
                                map[t]=uv;
                            else
                                map[t]={value:uv, caption:cap};
                        }else{
                            map[t]=uv;
                        }
                    }
                    // for absValue
                    if(updateUIValue!==false && profile.renderId && profile.box['xui.absValue'])
                        b.updateValue();
                }
            });

            // adjust UI data
            if(adjustData)
                map = _.tryF(adjustData,[map, prf],this);

            if(!ignoreEvent && prf.afterUpdateDataFromUI){
                mapb = this.afterUpdateDataFromUI(prf, map);
                if(_.isHash(mapb))map=mapb;
                mapb=null;
            }

            _.merge(prf.properties.data,map,'all');

            return true;
        },
        updateDataToUI:function(adjustData, dataKeys, ignoreEvent){
            var t,p,v,c,b,pp,uv,eh,
                ns=this,
                prf=ns.get(0),
                prop=prf.properties,
                map={},mapb;

            _.merge(map,prop.data,function(v,t){
                return !dataKeys || dataKeys===t || (_.isArr(dataKeys)?_.arr.indexOf(dataKeys,t)!=-1:false);
            });

            if(adjustData)
                map = _.tryF(adjustData,[map, prf],ns);

            if(!ignoreEvent && prf.beforeUpdateDataToUI){
                mapb = ns.beforeUpdateDataToUI(prf, map);
                if(_.isHash(mapb))map=mapb;
                mapb=null;
            }

            _.arr.each(ns.constructor._getBoundElems(prf),function(profile){
                p=profile.properties;
                eh=profile.box.$EventHandlers;
                t=p.dataField || p.name || profile.alias;
                if(!dataKeys || dataKeys===t || (_.isArr(dataKeys)?_.arr.indexOf(dataKeys,t)!=-1:false)){
                    // need reset?
                    if(map && t in map){
                        v=_.clone(map[t],null,2);
                        uv=c=null;
                        b=profile.boxing();
                        if(_.isHash(v)){
                            if(pp=v.properties){
                                _.filter(pp,function(o,i){
                                    return i in p;
                                });
                                // keep value and caption at first
                                c=_.isSet(pp.caption)?pp.caption:null;
                                uv=_.isSet(pp.value)?pp.value:null;
                                delete pp.caption;delete pp.value;
                                if(!_.isEmpty(pp))
                                    b.setProperties(pp);
                                delete v.properties;
                            }
                            if(pp=v.theme){if(typeof(b.setTheme)=="function")b.setTheme(pp);delete v.theme}
                            if(pp=v.CS){if(!_.isEmpty(pp))b.setCustomStyle(pp);delete v.CS}
                            if(pp=v.CC){if(!_.isEmpty(pp))b.setCustomClass(pp);delete v.CC}
                            if(pp=v.CA){if(!_.isEmpty(pp))b.setCustomAttr(pp);delete v.CA}

                            if(!_.isEmpty(v)){
                                _.filter(v,function(o,i){
                                    return (i in p) || (i in v);
                                });
                                if(!_.isEmpty(v)){
                                    // keep value and caption at first
                                    // value and caption in properties have high priority
                                    c=_.isSet(c)?c:_.isSet(v.caption)?v.caption:null;
                                    uv=_.isSet(uv)?uv:_.isSet(v.value)?v.value:null;
                                    delete v.caption;delete v.value;
                                    
                                    if(!_.isEmpty(v))
                                        b.setProperties(v);
                                }
                            }
                        }else uv=v;
                        // set value and caption at last
                        if(_.isSet(uv) && _.isFun(b.resetValue)){
                            b.resetValue(uv);
                            profile.__returnArray=_.isArr(uv);
                        }
                        // set caption
                        if(_.isSet(c) && _.isFun(b.setCaption))
                            _.tryF(b.setCaption,[c,true],b);
                    }
                }
            });
            return ns;
        }
    },
    Static:{
        $nameTag:"databinder_",
        _pool:{},
        _objectProp:{tagVar:1,propBinder:1,data:1},
        destroyAll:function(){
            this.pack(_.toArr(this._pool,false),false).destroy();
            this._pool={};
        },
        getFromName:function(name){
            var o=this._pool[name];
            return o && o.boxing();
        },
        _beforeSerialized:function(profile){
            var o={};
            _.merge(o, profile, 'all');
            var p = o.properties = _.clone(profile.properties,true);
            for(var i in profile.box._objectProp)
                if((i in p) && p[i] && (_.isHash(p[i])||_.isArr(p[i])) && _.isEmpty(p[i]))delete p[i];
            return o;
        },                
        _getBoundElems:function(prf){
            var arr=[];
            _.arr.each(prf._n,function(profile){
                // for container
                if(profile.behavior.PanelKeys){
                     xui.absValue.pack(profile.boxing().getChildren(null, true)).each(function(p){
                        arr.push(p);
                    });
                }
                // for absValue
                else if(profile.box['xui.absValue']){
                    arr.push(profile);
                }
            });
            return _.arr.removeDuplicate(arr);
        },
        _bind:function(name, profile){
            if(!name)return;
            var o=this._pool[name];
            if(!o){
                b=new xui.DataBinder();
                b.setName(name);
                o=b.get(0);
            }
            if(profile){
                if(_.arr.indexOf(o._n,profile)==-1){
                    //use link for 'destroy UIProfile' trigger 'auto unbind function '
                    profile.link(o._n, 'databinder.'+name);
                }
            }
        },
        _unBind:function(name, profile){
            if(profile && profile.box && this._pool[name])
                profile.unLink('databinder.'+name);
        },
        DataModel:{
            dataBinder:null,
            dataField:null,            
            "name":{
                set:function(value){
                    var o=this,
                        ovalue=o.properties.name,
                         c=o.box,
                        _p=c._pool,
                        _old=_p[ovalue],
                        _new=_p[value],
                        ui;

                    //if it exists, overwrite it dir
                    //if(_old && _new)
                    //    throw value+' exists!';

                    _p[o.properties.name=value]=o;
                    //modify name
                    if(_old && !_new && o._n.length)
                        for(var i=0,l=o._n.length;i<l;i++)
                            _.set(o._n[i], ["properties","dataBinder"], value);

                    //pointer _old the old one
                    if(_new && !_old) o._n=_new._n;
                    //delete the old name from pool
                    if(_old)delete _p[ovalue];
                }
            },            
            "data":{
                ini:{}
            }
        },
        EventHandlers:{
            beforeInputAlert:function(profile, ctrlPrf, type){},
            beforeUpdateDataToUI:function(profile, dataToUI){},
            afterUpdateDataFromUI:function(profile, dataFromUI){}
        }
    }
});