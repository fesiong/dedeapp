/**
 * html2Json 改造来自: https://github.com/Jxck/html2json
 */
import HTMLParser from './htmlParser'
// Block Elements - HTML 5 not video not audio
var block = makeMap("address,code,article,applet,aside,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul");

// Inline Elements - HTML 5- not-img not-a
var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,del,dfn,em,font,i,iframe,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

function makeMap(str) {
	var obj = {}, items = str.split(",");
	for (var i = 0; i < items.length; i++)
		obj[items[i]] = true;
	return obj;
}

function removeDOCTYPE(html) {
    return html
        .replace(/<\?xml.*\?>\n/, '')
        .replace(/<.*!doctype.*\>\n/, '')
        .replace(/<.*!DOCTYPE.*\>\n/, '');
}

function trimHtml(html) {
    return html
        .replace(/\r?\n+/g, '')
        .replace(/<!--.*?-->/ig, '')
        .replace(/\/\*.*?\*\//ig, '')
        .replace(/[ ]+</ig, '<')
}

function strcharacterDiscode(str) {
    // 加入常用解析
    str = str.replace(/&nbsp;/g, ' ');
    str = str.replace(/&quot;/g, "\"");
    str = str.replace(/&#39;/g, "'");
    str = str.replace(/&amp;/g, '&');
    // str = str.replace(/&lt;/g, '‹');
    // str = str.replace(/&gt;/g, '›');

    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&#8226;/g, '•');

    return str;
}

function getTagName(name) {
    let tagName = name;
    if(inline[name]){
        tagName = 'text'
    }else if(block[name]){
        tagName = 'view'
    }

    return tagName;
}

function html2json(html) {
    if(!html){
        return [];
    }
    //处理字符串
    html = removeDOCTYPE(html);
    html = trimHtml(html);
    //html = strcharacterDiscode(html);
    //生成node节点
    var bufArray = [];
    var results = {
        children: [],
    };
    var index = 0;
    HTMLParser(html, {
        start: function (name, attrs, unary) {
            //debug(tag, attrs, unary);
            // node for this element
            var node = {
                tagName: getTagName(name),
                name: name,
                attrs: {}
            };

            if (bufArray.length === 0) {
                node.index = index.toString()
                index += 1
            } else {
                var parent = bufArray[0];
                if (parent.children === undefined) {
                    parent.children = [];
                }
                node.index = parent.index + '.' + parent.children.length
            }

            if (attrs.length !== 0) {
                node.attrs = attrs.reduce(function (pre, attr) {
                    var name = attr.name;
                    var value = attr.value;
                    if (name.indexOf("-")) {
                        let nameArr = name.split("-")
                        for (let item of nameArr) {
                            item = item[0].toUpperCase() + item.substring(1, item.length)
                        }
                        name = nameArr.join()
                    }
                    if (name == 'class') {
                        value = 'rich-' + node.name + ' ' + value
                    }
                    // if attr already exists
                    // merge it
                    if (pre[name]) {
                        pre[name] = pre[name] + value;
                    } else {
                        // not exist, put it
                        pre[name] = value;
                    }

                    return pre;
                }, {});
            }

            //class 每一个都要加上
            node.attrs.class = 'rich-' + node.name + (node.attrs.class ? ' ' + node.attrs.class : '')

            //对img添加额外数据
            if (node.name === 'img') {
                var imgUrl = node.attrs.src;
                if (imgUrl[0] == '') {
                    imgUrl.splice(0, 1);
                }

                node.attrs.src = imgUrl;
            }

            // 处理font标签样式属性
            if (node.name === 'font') {
                var fontSize = ['x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', '-webkit-xxx-large'];
                var styleAttrs = {
                    'color': 'color',
                    'face': 'font-family',
                    'size': 'font-size'
                };

                if (typeof node.attrs != "undefined" && node.attrs != 'null' && node.attrs != '') {
                    if (!node.attrs.style) node.attrs.style = '';
                }

                if (typeof node.attrs != "undefined" && node.attrs != 'null' && node.attrs != '') {
                    for (var key in styleAttrs) {
                        if (node.attrs[key]) {
                            var value = key === 'size' ? fontSize[node.attrs[key] - 1] : node.attrs[key];
                            node.attrs.style += styleAttrs[key] + ': ' + value + ';';
                        }
                    }
                }
            }

            //临时记录source资源
            if (node.name === 'source') {
                results.source = node.attrs.src;
            }

            if (unary) {
                // if this tag doesn't have end tag
                // like <img src="hoge.png"/>
                // add to parents
                var parent = bufArray[0] || results;
                if (parent.children === undefined) {
                    parent.children = [];
                }
                parent.children.push(node);
            } else {
                bufArray.unshift(node);
            }
        },
        end: function (name) {
            //debug(tag);
            // merge into parent tag
            var node = bufArray.shift();
            if (node.name !== name) console.error('invalid state: mismatch end tag');

            //当有缓存source资源时于于video补上src资源
            if (node.name === 'video' && results.source) {
                node.attrs.src = results.source;
                delete results.source;
            }

            if (bufArray.length === 0) {
                results.children.push(node);
            } else {
                var parent = bufArray[0];
                if (parent.children === undefined) {
                    parent.children = [];
                }
                parent.children.push(node);
            }
            //table 强制修正td宽度
            if(name === 'tr') {
                let single = (100/node.children.length).toFixed(5)
                for (let item of node.children) {
                    item.attrs.style = 'width: '+single+'%;' + (item.attrs.style ? item.attrs.style : '')
                }
            }
        },
        chars: function (text) {
            text = strcharacterDiscode(text);
            var node = {
                type: 'text',
                text: text,
            };

            if (bufArray.length === 0) {
                node.index = index.toString()
                index += 1
                results.children.push(node);
            } else {
                var parent = bufArray[0];
                if (parent.children === undefined) {
                    parent.children = [];
                }
                node.index = parent.index + '.' + parent.children.length
                parent.children.push(node);
            }
        },
        comment: function (text) {
            // var node = {
            //     node: 'comment',
            //     text: text,
            // };
            // var parent = bufArray[0];
            // if (parent.children === undefined) {
            //     parent.children = [];
            // }
            // parent.children.push(node);
        },
    });
    return results.children;
};

export default html2json