"use strict";var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};function _classCallCheck2(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'");}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e);},f,f.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;})({1:[function(require,module,exports){'use strict';var acorn=require('acorn');var walk=require('acorn/dist/walk');function isScope(node){return node.type==='FunctionExpression'||node.type==='FunctionDeclaration'||node.type==='ArrowFunctionExpression'||node.type==='Program';}function isBlockScope(node){return node.type==='BlockStatement'||isScope(node);}function declaresArguments(node){return node.type==='FunctionExpression'||node.type==='FunctionDeclaration';}function declaresThis(node){return node.type==='FunctionExpression'||node.type==='FunctionDeclaration';}function reallyParse(source){try{return acorn.parse(source,{ecmaVersion:6,allowReturnOutsideFunction:true,allowImportExportEverywhere:true,allowHashBang:true});}catch(ex){return acorn.parse(source,{ecmaVersion:5,allowReturnOutsideFunction:true,allowImportExportEverywhere:true,allowHashBang:true});}}module.exports=findGlobals;module.exports.parse=reallyParse;function findGlobals(source){var globals=[];var ast; // istanbul ignore else
if(typeof source==='string'){ast=reallyParse(source);}else {ast=source;} // istanbul ignore if
if(!(ast&&(typeof ast==="undefined"?"undefined":_typeof(ast))==='object'&&ast.type==='Program')){throw new TypeError('Source must be either a string of JavaScript or an acorn AST');}var declareFunction=function declareFunction(node){var fn=node;fn.locals=fn.locals||{};node.params.forEach(function(node){declarePattern(node,fn);});if(node.id){fn.locals[node.id.name]=true;}};var declarePattern=function declarePattern(node,parent){switch(node.type){case 'Identifier':parent.locals[node.name]=true;break;case 'ObjectPattern':node.properties.forEach(function(node){declarePattern(node.value,parent);});break;case 'ArrayPattern':node.elements.forEach(function(node){if(node)declarePattern(node,parent);});break;case 'RestElement':declarePattern(node.argument,parent);break;case 'AssignmentPattern':declarePattern(node.left,parent);break; // istanbul ignore next
default:throw new Error('Unrecognized pattern type: '+node.type);}};var declareModuleSpecifier=function declareModuleSpecifier(node,parents){ast.locals=ast.locals||{};ast.locals[node.local.name]=true;};walk.ancestor(ast,{'VariableDeclaration':function VariableDeclaration(node,parents){var parent=null;for(var i=parents.length-1;i>=0&&parent===null;i--){if(node.kind==='var'?isScope(parents[i]):isBlockScope(parents[i])){parent=parents[i];}}parent.locals=parent.locals||{};node.declarations.forEach(function(declaration){declarePattern(declaration.id,parent);});},'FunctionDeclaration':function FunctionDeclaration(node,parents){var parent=null;for(var i=parents.length-2;i>=0&&parent===null;i--){if(isScope(parents[i])){parent=parents[i];}}parent.locals=parent.locals||{};parent.locals[node.id.name]=true;declareFunction(node);},'Function':declareFunction,'ClassDeclaration':function ClassDeclaration(node,parents){var parent=null;for(var i=parents.length-2;i>=0&&parent===null;i--){if(isScope(parents[i])){parent=parents[i];}}parent.locals=parent.locals||{};parent.locals[node.id.name]=true;},'TryStatement':function TryStatement(node){if(node.handler===null)return;node.handler.body.locals=node.handler.body.locals||{};node.handler.body.locals[node.handler.param.name]=true;},'ImportDefaultSpecifier':declareModuleSpecifier,'ImportSpecifier':declareModuleSpecifier,'ImportNamespaceSpecifier':declareModuleSpecifier});function identifier(node,parents){var name=node.name;if(name==='undefined')return;for(var i=0;i<parents.length;i++){if(name==='arguments'&&declaresArguments(parents[i])){return;}if(parents[i].locals&&name in parents[i].locals){return;}}if(parents[parents.length-2]&&parents[parents.length-2].type==='TryStatement'&&parents[parents.length-2].handler&&node===parents[parents.length-2].handler.param){return;}node.parents=parents;globals.push(node);}walk.ancestor(ast,{'VariablePattern':identifier,'Identifier':identifier,'ThisExpression':function ThisExpression(node,parents){for(var i=0;i<parents.length;i++){if(declaresThis(parents[i])){return;}}node.parents=parents;globals.push(node);}});var groupedGlobals={};globals.forEach(function(node){groupedGlobals[node.name]=groupedGlobals[node.name]||[];groupedGlobals[node.name].push(node);});return Object.keys(groupedGlobals).sort().map(function(name){return {name:name,nodes:groupedGlobals[name]};});}},{"acorn":2,"acorn/dist/walk":3}],2:[function(require,module,exports){(function(global){(function(f){if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else {var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else {g=this;}g.acorn=f();}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;}({1:[function(_dereq_,module,exports){ // A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser
"use strict";var _tokentype=_dereq_("./tokentype");var _state=_dereq_("./state");var pp=_state.Parser.prototype; // Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.
pp.checkPropClash=function(prop,propHash){if(this.options.ecmaVersion>=6&&(prop.computed||prop.method||prop.shorthand))return;var key=prop.key;var name=undefined;switch(key.type){case "Identifier":name=key.name;break;case "Literal":name=String(key.value);break;default:return;}var kind=prop.kind;if(this.options.ecmaVersion>=6){if(name==="__proto__"&&kind==="init"){if(propHash.proto)this.raise(key.start,"Redefinition of __proto__ property");propHash.proto=true;}return;}name="$"+name;var other=propHash[name];if(other){var isGetSet=kind!=="init";if((this.strict||isGetSet)&&other[kind]||!(isGetSet^other.init))this.raise(key.start,"Redefinition of property");}else {other=propHash[name]={init:false,get:false,set:false};}other[kind]=true;}; // ### Expression parsing
// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.
// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).
pp.parseExpression=function(noIn,refDestructuringErrors){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseMaybeAssign(noIn,refDestructuringErrors);if(this.type===_tokentype.types.comma){var node=this.startNodeAt(startPos,startLoc);node.expressions=[expr];while(this.eat(_tokentype.types.comma)){node.expressions.push(this.parseMaybeAssign(noIn,refDestructuringErrors));}return this.finishNode(node,"SequenceExpression");}return expr;}; // Parse an assignment expression. This includes applications of
// operators like `+=`.
pp.parseMaybeAssign=function(noIn,refDestructuringErrors,afterLeftParse){if(this.type==_tokentype.types._yield&&this.inGenerator)return this.parseYield();var validateDestructuring=false;if(!refDestructuringErrors){refDestructuringErrors={shorthandAssign:0,trailingComma:0};validateDestructuring=true;}var startPos=this.start,startLoc=this.startLoc;if(this.type==_tokentype.types.parenL||this.type==_tokentype.types.name)this.potentialArrowAt=this.start;var left=this.parseMaybeConditional(noIn,refDestructuringErrors);if(afterLeftParse)left=afterLeftParse.call(this,left,startPos,startLoc);if(this.type.isAssign){if(validateDestructuring)this.checkPatternErrors(refDestructuringErrors,true);var node=this.startNodeAt(startPos,startLoc);node.operator=this.value;node.left=this.type===_tokentype.types.eq?this.toAssignable(left):left;refDestructuringErrors.shorthandAssign=0; // reset because shorthand default was used correctly
this.checkLVal(left);this.next();node.right=this.parseMaybeAssign(noIn);return this.finishNode(node,"AssignmentExpression");}else {if(validateDestructuring)this.checkExpressionErrors(refDestructuringErrors,true);}return left;}; // Parse a ternary conditional (`?:`) operator.
pp.parseMaybeConditional=function(noIn,refDestructuringErrors){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseExprOps(noIn,refDestructuringErrors);if(this.checkExpressionErrors(refDestructuringErrors))return expr;if(this.eat(_tokentype.types.question)){var node=this.startNodeAt(startPos,startLoc);node.test=expr;node.consequent=this.parseMaybeAssign();this.expect(_tokentype.types.colon);node.alternate=this.parseMaybeAssign(noIn);return this.finishNode(node,"ConditionalExpression");}return expr;}; // Start the precedence parser.
pp.parseExprOps=function(noIn,refDestructuringErrors){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseMaybeUnary(refDestructuringErrors);if(this.checkExpressionErrors(refDestructuringErrors))return expr;return this.parseExprOp(expr,startPos,startLoc,-1,noIn);}; // Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.
pp.parseExprOp=function(left,leftStartPos,leftStartLoc,minPrec,noIn){var prec=this.type.binop;if(prec!=null&&(!noIn||this.type!==_tokentype.types._in)){if(prec>minPrec){var node=this.startNodeAt(leftStartPos,leftStartLoc);node.left=left;node.operator=this.value;var op=this.type;this.next();var startPos=this.start,startLoc=this.startLoc;node.right=this.parseExprOp(this.parseMaybeUnary(),startPos,startLoc,prec,noIn);this.finishNode(node,op===_tokentype.types.logicalOR||op===_tokentype.types.logicalAND?"LogicalExpression":"BinaryExpression");return this.parseExprOp(node,leftStartPos,leftStartLoc,minPrec,noIn);}}return left;}; // Parse unary operators, both prefix and postfix.
pp.parseMaybeUnary=function(refDestructuringErrors){if(this.type.prefix){var node=this.startNode(),update=this.type===_tokentype.types.incDec;node.operator=this.value;node.prefix=true;this.next();node.argument=this.parseMaybeUnary();this.checkExpressionErrors(refDestructuringErrors,true);if(update)this.checkLVal(node.argument);else if(this.strict&&node.operator==="delete"&&node.argument.type==="Identifier")this.raise(node.start,"Deleting local variable in strict mode");return this.finishNode(node,update?"UpdateExpression":"UnaryExpression");}var startPos=this.start,startLoc=this.startLoc;var expr=this.parseExprSubscripts(refDestructuringErrors);if(this.checkExpressionErrors(refDestructuringErrors))return expr;while(this.type.postfix&&!this.canInsertSemicolon()){var node=this.startNodeAt(startPos,startLoc);node.operator=this.value;node.prefix=false;node.argument=expr;this.checkLVal(expr);this.next();expr=this.finishNode(node,"UpdateExpression");}return expr;}; // Parse call, dot, and `[]`-subscript expressions.
pp.parseExprSubscripts=function(refDestructuringErrors){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseExprAtom(refDestructuringErrors);var skipArrowSubscripts=expr.type==="ArrowFunctionExpression"&&this.input.slice(this.lastTokStart,this.lastTokEnd)!==")";if(this.checkExpressionErrors(refDestructuringErrors)||skipArrowSubscripts)return expr;return this.parseSubscripts(expr,startPos,startLoc);};pp.parseSubscripts=function(base,startPos,startLoc,noCalls){for(;;){if(this.eat(_tokentype.types.dot)){var node=this.startNodeAt(startPos,startLoc);node.object=base;node.property=this.parseIdent(true);node.computed=false;base=this.finishNode(node,"MemberExpression");}else if(this.eat(_tokentype.types.bracketL)){var node=this.startNodeAt(startPos,startLoc);node.object=base;node.property=this.parseExpression();node.computed=true;this.expect(_tokentype.types.bracketR);base=this.finishNode(node,"MemberExpression");}else if(!noCalls&&this.eat(_tokentype.types.parenL)){var node=this.startNodeAt(startPos,startLoc);node.callee=base;node.arguments=this.parseExprList(_tokentype.types.parenR,false);base=this.finishNode(node,"CallExpression");}else if(this.type===_tokentype.types.backQuote){var node=this.startNodeAt(startPos,startLoc);node.tag=base;node.quasi=this.parseTemplate();base=this.finishNode(node,"TaggedTemplateExpression");}else {return base;}}}; // Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.
pp.parseExprAtom=function(refDestructuringErrors){var node=undefined,canBeArrow=this.potentialArrowAt==this.start;switch(this.type){case _tokentype.types._super:if(!this.inFunction)this.raise(this.start,"'super' outside of function or class");case _tokentype.types._this:var type=this.type===_tokentype.types._this?"ThisExpression":"Super";node=this.startNode();this.next();return this.finishNode(node,type);case _tokentype.types._yield:if(this.inGenerator)this.unexpected();case _tokentype.types.name:var startPos=this.start,startLoc=this.startLoc;var id=this.parseIdent(this.type!==_tokentype.types.name);if(canBeArrow&&!this.canInsertSemicolon()&&this.eat(_tokentype.types.arrow))return this.parseArrowExpression(this.startNodeAt(startPos,startLoc),[id]);return id;case _tokentype.types.regexp:var value=this.value;node=this.parseLiteral(value.value);node.regex={pattern:value.pattern,flags:value.flags};return node;case _tokentype.types.num:case _tokentype.types.string:return this.parseLiteral(this.value);case _tokentype.types._null:case _tokentype.types._true:case _tokentype.types._false:node=this.startNode();node.value=this.type===_tokentype.types._null?null:this.type===_tokentype.types._true;node.raw=this.type.keyword;this.next();return this.finishNode(node,"Literal");case _tokentype.types.parenL:return this.parseParenAndDistinguishExpression(canBeArrow);case _tokentype.types.bracketL:node=this.startNode();this.next(); // check whether this is array comprehension or regular array
if(this.options.ecmaVersion>=7&&this.type===_tokentype.types._for){return this.parseComprehension(node,false);}node.elements=this.parseExprList(_tokentype.types.bracketR,true,true,refDestructuringErrors);return this.finishNode(node,"ArrayExpression");case _tokentype.types.braceL:return this.parseObj(false,refDestructuringErrors);case _tokentype.types._function:node=this.startNode();this.next();return this.parseFunction(node,false);case _tokentype.types._class:return this.parseClass(this.startNode(),false);case _tokentype.types._new:return this.parseNew();case _tokentype.types.backQuote:return this.parseTemplate();default:this.unexpected();}};pp.parseLiteral=function(value){var node=this.startNode();node.value=value;node.raw=this.input.slice(this.start,this.end);this.next();return this.finishNode(node,"Literal");};pp.parseParenExpression=function(){this.expect(_tokentype.types.parenL);var val=this.parseExpression();this.expect(_tokentype.types.parenR);return val;};pp.parseParenAndDistinguishExpression=function(canBeArrow){var startPos=this.start,startLoc=this.startLoc,val=undefined;if(this.options.ecmaVersion>=6){this.next();if(this.options.ecmaVersion>=7&&this.type===_tokentype.types._for){return this.parseComprehension(this.startNodeAt(startPos,startLoc),true);}var innerStartPos=this.start,innerStartLoc=this.startLoc;var exprList=[],first=true;var refDestructuringErrors={shorthandAssign:0,trailingComma:0},spreadStart=undefined,innerParenStart=undefined;while(this.type!==_tokentype.types.parenR){first?first=false:this.expect(_tokentype.types.comma);if(this.type===_tokentype.types.ellipsis){spreadStart=this.start;exprList.push(this.parseParenItem(this.parseRest()));break;}else {if(this.type===_tokentype.types.parenL&&!innerParenStart){innerParenStart=this.start;}exprList.push(this.parseMaybeAssign(false,refDestructuringErrors,this.parseParenItem));}}var innerEndPos=this.start,innerEndLoc=this.startLoc;this.expect(_tokentype.types.parenR);if(canBeArrow&&!this.canInsertSemicolon()&&this.eat(_tokentype.types.arrow)){this.checkPatternErrors(refDestructuringErrors,true);if(innerParenStart)this.unexpected(innerParenStart);return this.parseParenArrowList(startPos,startLoc,exprList);}if(!exprList.length)this.unexpected(this.lastTokStart);if(spreadStart)this.unexpected(spreadStart);this.checkExpressionErrors(refDestructuringErrors,true);if(exprList.length>1){val=this.startNodeAt(innerStartPos,innerStartLoc);val.expressions=exprList;this.finishNodeAt(val,"SequenceExpression",innerEndPos,innerEndLoc);}else {val=exprList[0];}}else {val=this.parseParenExpression();}if(this.options.preserveParens){var par=this.startNodeAt(startPos,startLoc);par.expression=val;return this.finishNode(par,"ParenthesizedExpression");}else {return val;}};pp.parseParenItem=function(item){return item;};pp.parseParenArrowList=function(startPos,startLoc,exprList){return this.parseArrowExpression(this.startNodeAt(startPos,startLoc),exprList);}; // New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.
var empty=[];pp.parseNew=function(){var node=this.startNode();var meta=this.parseIdent(true);if(this.options.ecmaVersion>=6&&this.eat(_tokentype.types.dot)){node.meta=meta;node.property=this.parseIdent(true);if(node.property.name!=="target")this.raise(node.property.start,"The only valid meta property for new is new.target");if(!this.inFunction)this.raise(node.start,"new.target can only be used in functions");return this.finishNode(node,"MetaProperty");}var startPos=this.start,startLoc=this.startLoc;node.callee=this.parseSubscripts(this.parseExprAtom(),startPos,startLoc,true);if(this.eat(_tokentype.types.parenL))node.arguments=this.parseExprList(_tokentype.types.parenR,false);else node.arguments=empty;return this.finishNode(node,"NewExpression");}; // Parse template expression.
pp.parseTemplateElement=function(){var elem=this.startNode();elem.value={raw:this.input.slice(this.start,this.end).replace(/\r\n?/g,'\n'),cooked:this.value};this.next();elem.tail=this.type===_tokentype.types.backQuote;return this.finishNode(elem,"TemplateElement");};pp.parseTemplate=function(){var node=this.startNode();this.next();node.expressions=[];var curElt=this.parseTemplateElement();node.quasis=[curElt];while(!curElt.tail){this.expect(_tokentype.types.dollarBraceL);node.expressions.push(this.parseExpression());this.expect(_tokentype.types.braceR);node.quasis.push(curElt=this.parseTemplateElement());}this.next();return this.finishNode(node,"TemplateLiteral");}; // Parse an object literal or binding pattern.
pp.parseObj=function(isPattern,refDestructuringErrors){var node=this.startNode(),first=true,propHash={};node.properties=[];this.next();while(!this.eat(_tokentype.types.braceR)){if(!first){this.expect(_tokentype.types.comma);if(this.afterTrailingComma(_tokentype.types.braceR))break;}else first=false;var prop=this.startNode(),isGenerator=undefined,startPos=undefined,startLoc=undefined;if(this.options.ecmaVersion>=6){prop.method=false;prop.shorthand=false;if(isPattern||refDestructuringErrors){startPos=this.start;startLoc=this.startLoc;}if(!isPattern)isGenerator=this.eat(_tokentype.types.star);}this.parsePropertyName(prop);this.parsePropertyValue(prop,isPattern,isGenerator,startPos,startLoc,refDestructuringErrors);this.checkPropClash(prop,propHash);node.properties.push(this.finishNode(prop,"Property"));}return this.finishNode(node,isPattern?"ObjectPattern":"ObjectExpression");};pp.parsePropertyValue=function(prop,isPattern,isGenerator,startPos,startLoc,refDestructuringErrors){if(this.eat(_tokentype.types.colon)){prop.value=isPattern?this.parseMaybeDefault(this.start,this.startLoc):this.parseMaybeAssign(false,refDestructuringErrors);prop.kind="init";}else if(this.options.ecmaVersion>=6&&this.type===_tokentype.types.parenL){if(isPattern)this.unexpected();prop.kind="init";prop.method=true;prop.value=this.parseMethod(isGenerator);}else if(this.options.ecmaVersion>=5&&!prop.computed&&prop.key.type==="Identifier"&&(prop.key.name==="get"||prop.key.name==="set")&&this.type!=_tokentype.types.comma&&this.type!=_tokentype.types.braceR){if(isGenerator||isPattern)this.unexpected();prop.kind=prop.key.name;this.parsePropertyName(prop);prop.value=this.parseMethod(false);var paramCount=prop.kind==="get"?0:1;if(prop.value.params.length!==paramCount){var start=prop.value.start;if(prop.kind==="get")this.raise(start,"getter should have no params");else this.raise(start,"setter should have exactly one param");}if(prop.kind==="set"&&prop.value.params[0].type==="RestElement")this.raise(prop.value.params[0].start,"Setter cannot use rest params");}else if(this.options.ecmaVersion>=6&&!prop.computed&&prop.key.type==="Identifier"){prop.kind="init";if(isPattern){if(this.keywords.test(prop.key.name)||(this.strict?this.reservedWordsStrictBind:this.reservedWords).test(prop.key.name))this.raise(prop.key.start,"Binding "+prop.key.name);prop.value=this.parseMaybeDefault(startPos,startLoc,prop.key);}else if(this.type===_tokentype.types.eq&&refDestructuringErrors){if(!refDestructuringErrors.shorthandAssign)refDestructuringErrors.shorthandAssign=this.start;prop.value=this.parseMaybeDefault(startPos,startLoc,prop.key);}else {prop.value=prop.key;}prop.shorthand=true;}else this.unexpected();};pp.parsePropertyName=function(prop){if(this.options.ecmaVersion>=6){if(this.eat(_tokentype.types.bracketL)){prop.computed=true;prop.key=this.parseMaybeAssign();this.expect(_tokentype.types.bracketR);return prop.key;}else {prop.computed=false;}}return prop.key=this.type===_tokentype.types.num||this.type===_tokentype.types.string?this.parseExprAtom():this.parseIdent(true);}; // Initialize empty function node.
pp.initFunction=function(node){node.id=null;if(this.options.ecmaVersion>=6){node.generator=false;node.expression=false;}}; // Parse object or class method.
pp.parseMethod=function(isGenerator){var node=this.startNode();this.initFunction(node);this.expect(_tokentype.types.parenL);node.params=this.parseBindingList(_tokentype.types.parenR,false,false);if(this.options.ecmaVersion>=6)node.generator=isGenerator;this.parseFunctionBody(node,false);return this.finishNode(node,"FunctionExpression");}; // Parse arrow function expression with given parameters.
pp.parseArrowExpression=function(node,params){this.initFunction(node);node.params=this.toAssignableList(params,true);this.parseFunctionBody(node,true);return this.finishNode(node,"ArrowFunctionExpression");}; // Parse function body and check parameters.
pp.parseFunctionBody=function(node,isArrowFunction){var isExpression=isArrowFunction&&this.type!==_tokentype.types.braceL;if(isExpression){node.body=this.parseMaybeAssign();node.expression=true;}else { // Start a new scope with regard to labels and the `inFunction`
// flag (restore them to their old value afterwards).
var oldInFunc=this.inFunction,oldInGen=this.inGenerator,oldLabels=this.labels;this.inFunction=true;this.inGenerator=node.generator;this.labels=[];node.body=this.parseBlock(true);node.expression=false;this.inFunction=oldInFunc;this.inGenerator=oldInGen;this.labels=oldLabels;} // If this is a strict mode function, verify that argument names
// are not repeated, and it does not try to bind the words `eval`
// or `arguments`.
if(this.strict||!isExpression&&node.body.body.length&&this.isUseStrict(node.body.body[0])){var oldStrict=this.strict;this.strict=true;if(node.id)this.checkLVal(node.id,true);this.checkParams(node);this.strict=oldStrict;}else if(isArrowFunction){this.checkParams(node);}}; // Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.
pp.checkParams=function(node){var nameHash={};for(var i=0;i<node.params.length;i++){this.checkLVal(node.params[i],true,nameHash);}}; // Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).
pp.parseExprList=function(close,allowTrailingComma,allowEmpty,refDestructuringErrors){var elts=[],first=true;while(!this.eat(close)){if(!first){this.expect(_tokentype.types.comma);if(this.type===close&&refDestructuringErrors&&!refDestructuringErrors.trailingComma){refDestructuringErrors.trailingComma=this.lastTokStart;}if(allowTrailingComma&&this.afterTrailingComma(close))break;}else first=false;var elt=undefined;if(allowEmpty&&this.type===_tokentype.types.comma)elt=null;else if(this.type===_tokentype.types.ellipsis)elt=this.parseSpread(refDestructuringErrors);else elt=this.parseMaybeAssign(false,refDestructuringErrors);elts.push(elt);}return elts;}; // Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.
pp.parseIdent=function(liberal){var node=this.startNode();if(liberal&&this.options.allowReserved=="never")liberal=false;if(this.type===_tokentype.types.name){if(!liberal&&(this.strict?this.reservedWordsStrict:this.reservedWords).test(this.value)&&(this.options.ecmaVersion>=6||this.input.slice(this.start,this.end).indexOf("\\")==-1))this.raise(this.start,"The keyword '"+this.value+"' is reserved");node.name=this.value;}else if(liberal&&this.type.keyword){node.name=this.type.keyword;}else {this.unexpected();}this.next();return this.finishNode(node,"Identifier");}; // Parses yield expression inside generator.
pp.parseYield=function(){var node=this.startNode();this.next();if(this.type==_tokentype.types.semi||this.canInsertSemicolon()||this.type!=_tokentype.types.star&&!this.type.startsExpr){node.delegate=false;node.argument=null;}else {node.delegate=this.eat(_tokentype.types.star);node.argument=this.parseMaybeAssign();}return this.finishNode(node,"YieldExpression");}; // Parses array and generator comprehensions.
pp.parseComprehension=function(node,isGenerator){node.blocks=[];while(this.type===_tokentype.types._for){var block=this.startNode();this.next();this.expect(_tokentype.types.parenL);block.left=this.parseBindingAtom();this.checkLVal(block.left,true);this.expectContextual("of");block.right=this.parseExpression();this.expect(_tokentype.types.parenR);node.blocks.push(this.finishNode(block,"ComprehensionBlock"));}node.filter=this.eat(_tokentype.types._if)?this.parseParenExpression():null;node.body=this.parseExpression();this.expect(isGenerator?_tokentype.types.parenR:_tokentype.types.bracketR);node.generator=isGenerator;return this.finishNode(node,"ComprehensionExpression");};},{"./state":10,"./tokentype":14}],2:[function(_dereq_,module,exports){ // This is a trick taken from Esprima. It turns out that, on
// non-Chrome browsers, to check whether a string is in a set, a
// predicate containing a big ugly `switch` statement is faster than
// a regular expression, and on Chrome the two are about on par.
// This function uses `eval` (non-lexical) to produce such a
// predicate from a space-separated string of words.
//
// It starts by sorting the words by length.
// Reserved word lists for various dialects of the language
"use strict";exports.__esModule=true;exports.isIdentifierStart=isIdentifierStart;exports.isIdentifierChar=isIdentifierChar;var reservedWords={3:"abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",5:"class enum extends super const export import",6:"enum",strict:"implements interface let package private protected public static yield",strictBind:"eval arguments"};exports.reservedWords=reservedWords; // And the keywords
var ecma5AndLessKeywords="break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";var keywords={5:ecma5AndLessKeywords,6:ecma5AndLessKeywords+" let const class extends export import yield super"};exports.keywords=keywords; // ## Character categories
// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.
var nonASCIIidentifierStartChars="ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢲऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞭꞰꞱꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭟꭤꭥꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";var nonASCIIidentifierChars="‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣤ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏ᦰ-ᧀᧈᧉ᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︭︳︴﹍-﹏０-９＿";var nonASCIIidentifierStart=new RegExp("["+nonASCIIidentifierStartChars+"]");var nonASCIIidentifier=new RegExp("["+nonASCIIidentifierStartChars+nonASCIIidentifierChars+"]");nonASCIIidentifierStartChars=nonASCIIidentifierChars=null; // These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by tools/generate-identifier-regex.js
var astralIdentifierStartCodes=[0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,17,26,6,37,11,29,3,35,5,7,2,4,43,157,99,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,98,21,11,25,71,55,7,1,65,0,16,3,2,2,2,26,45,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,955,52,76,44,33,24,27,35,42,34,4,0,13,47,15,3,22,0,38,17,2,24,133,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,32,4,287,47,21,1,2,0,185,46,82,47,21,0,60,42,502,63,32,0,449,56,1288,920,104,110,2962,1070,13266,568,8,30,114,29,19,47,17,3,32,20,6,18,881,68,12,0,67,12,16481,1,3071,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,1340,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,16355,541];var astralIdentifierCodes=[509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,1306,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,52,0,13,2,49,13,16,9,83,11,168,11,6,9,8,2,57,0,2,6,3,1,3,2,10,0,11,1,3,6,4,4,316,19,13,9,214,6,3,8,112,16,16,9,82,12,9,9,535,9,20855,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,4305,6,792618,239]; // This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code,set){var pos=0x10000;for(var i=0;i<set.length;i+=2){pos+=set[i];if(pos>code)return false;pos+=set[i+1];if(pos>=code)return true;}} // Test whether a given character code starts an identifier.
function isIdentifierStart(code,astral){if(code<65)return code===36;if(code<91)return true;if(code<97)return code===95;if(code<123)return true;if(code<=0xffff)return code>=0xaa&&nonASCIIidentifierStart.test(String.fromCharCode(code));if(astral===false)return false;return isInAstralSet(code,astralIdentifierStartCodes);} // Test whether a given character is part of an identifier.
function isIdentifierChar(code,astral){if(code<48)return code===36;if(code<58)return true;if(code<65)return false;if(code<91)return true;if(code<97)return code===95;if(code<123)return true;if(code<=0xffff)return code>=0xaa&&nonASCIIidentifier.test(String.fromCharCode(code));if(astral===false)return false;return isInAstralSet(code,astralIdentifierStartCodes)||isInAstralSet(code,astralIdentifierCodes);}},{}],3:[function(_dereq_,module,exports){ // Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/ternjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/ternjs/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js
"use strict";exports.__esModule=true;exports.parse=parse;exports.parseExpressionAt=parseExpressionAt;exports.tokenizer=tokenizer;var _state=_dereq_("./state");_dereq_("./parseutil");_dereq_("./statement");_dereq_("./lval");_dereq_("./expression");_dereq_("./location");exports.Parser=_state.Parser;exports.plugins=_state.plugins;var _options=_dereq_("./options");exports.defaultOptions=_options.defaultOptions;var _locutil=_dereq_("./locutil");exports.Position=_locutil.Position;exports.SourceLocation=_locutil.SourceLocation;exports.getLineInfo=_locutil.getLineInfo;var _node=_dereq_("./node");exports.Node=_node.Node;var _tokentype=_dereq_("./tokentype");exports.TokenType=_tokentype.TokenType;exports.tokTypes=_tokentype.types;var _tokencontext=_dereq_("./tokencontext");exports.TokContext=_tokencontext.TokContext;exports.tokContexts=_tokencontext.types;var _identifier=_dereq_("./identifier");exports.isIdentifierChar=_identifier.isIdentifierChar;exports.isIdentifierStart=_identifier.isIdentifierStart;var _tokenize=_dereq_("./tokenize");exports.Token=_tokenize.Token;var _whitespace=_dereq_("./whitespace");exports.isNewLine=_whitespace.isNewLine;exports.lineBreak=_whitespace.lineBreak;exports.lineBreakG=_whitespace.lineBreakG;var version="2.7.0";exports.version=version; // The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
function parse(input,options){return new _state.Parser(options,input).parse();} // This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.
function parseExpressionAt(input,pos,options){var p=new _state.Parser(options,input,pos);p.nextToken();return p.parseExpression();} // Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.
function tokenizer(input,options){return new _state.Parser(options,input);}},{"./expression":1,"./identifier":2,"./location":4,"./locutil":5,"./lval":6,"./node":7,"./options":8,"./parseutil":9,"./state":10,"./statement":11,"./tokencontext":12,"./tokenize":13,"./tokentype":14,"./whitespace":16}],4:[function(_dereq_,module,exports){"use strict";var _state=_dereq_("./state");var _locutil=_dereq_("./locutil");var pp=_state.Parser.prototype; // This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.
pp.raise=function(pos,message){var loc=_locutil.getLineInfo(this.input,pos);message+=" ("+loc.line+":"+loc.column+")";var err=new SyntaxError(message);err.pos=pos;err.loc=loc;err.raisedAt=this.pos;throw err;};pp.curPosition=function(){if(this.options.locations){return new _locutil.Position(this.curLine,this.pos-this.lineStart);}};},{"./locutil":5,"./state":10}],5:[function(_dereq_,module,exports){"use strict";exports.__esModule=true;exports.getLineInfo=getLineInfo;function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var _whitespace=_dereq_("./whitespace"); // These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.
var Position=function(){function Position(line,col){_classCallCheck(this,Position);this.line=line;this.column=col;}Position.prototype.offset=function offset(n){return new Position(this.line,this.column+n);};return Position;}();exports.Position=Position;var SourceLocation=function SourceLocation(p,start,end){_classCallCheck(this,SourceLocation);this.start=start;this.end=end;if(p.sourceFile!==null)this.source=p.sourceFile;} // The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.
;exports.SourceLocation=SourceLocation;function getLineInfo(input,offset){for(var line=1,cur=0;;){_whitespace.lineBreakG.lastIndex=cur;var match=_whitespace.lineBreakG.exec(input);if(match&&match.index<offset){++line;cur=match.index+match[0].length;}else {return new Position(line,offset-cur);}}}},{"./whitespace":16}],6:[function(_dereq_,module,exports){"use strict";var _tokentype=_dereq_("./tokentype");var _state=_dereq_("./state");var _util=_dereq_("./util");var pp=_state.Parser.prototype; // Convert existing expression atom to assignable pattern
// if possible.
pp.toAssignable=function(node,isBinding){if(this.options.ecmaVersion>=6&&node){switch(node.type){case "Identifier":case "ObjectPattern":case "ArrayPattern":break;case "ObjectExpression":node.type="ObjectPattern";for(var i=0;i<node.properties.length;i++){var prop=node.properties[i];if(prop.kind!=="init")this.raise(prop.key.start,"Object pattern can't contain getter or setter");this.toAssignable(prop.value,isBinding);}break;case "ArrayExpression":node.type="ArrayPattern";this.toAssignableList(node.elements,isBinding);break;case "AssignmentExpression":if(node.operator==="="){node.type="AssignmentPattern";delete node.operator; // falls through to AssignmentPattern
}else {this.raise(node.left.end,"Only '=' operator can be used for specifying default value.");break;}case "AssignmentPattern":if(node.right.type==="YieldExpression")this.raise(node.right.start,"Yield expression cannot be a default value");break;case "ParenthesizedExpression":node.expression=this.toAssignable(node.expression,isBinding);break;case "MemberExpression":if(!isBinding)break;default:this.raise(node.start,"Assigning to rvalue");}}return node;}; // Convert list of expression atoms to binding list.
pp.toAssignableList=function(exprList,isBinding){var end=exprList.length;if(end){var last=exprList[end-1];if(last&&last.type=="RestElement"){--end;}else if(last&&last.type=="SpreadElement"){last.type="RestElement";var arg=last.argument;this.toAssignable(arg,isBinding);if(arg.type!=="Identifier"&&arg.type!=="MemberExpression"&&arg.type!=="ArrayPattern")this.unexpected(arg.start);--end;}if(isBinding&&last.type==="RestElement"&&last.argument.type!=="Identifier")this.unexpected(last.argument.start);}for(var i=0;i<end;i++){var elt=exprList[i];if(elt)this.toAssignable(elt,isBinding);}return exprList;}; // Parses spread element.
pp.parseSpread=function(refDestructuringErrors){var node=this.startNode();this.next();node.argument=this.parseMaybeAssign(refDestructuringErrors);return this.finishNode(node,"SpreadElement");};pp.parseRest=function(allowNonIdent){var node=this.startNode();this.next(); // RestElement inside of a function parameter must be an identifier
if(allowNonIdent)node.argument=this.type===_tokentype.types.name?this.parseIdent():this.unexpected();else node.argument=this.type===_tokentype.types.name||this.type===_tokentype.types.bracketL?this.parseBindingAtom():this.unexpected();return this.finishNode(node,"RestElement");}; // Parses lvalue (assignable) atom.
pp.parseBindingAtom=function(){if(this.options.ecmaVersion<6)return this.parseIdent();switch(this.type){case _tokentype.types.name:return this.parseIdent();case _tokentype.types.bracketL:var node=this.startNode();this.next();node.elements=this.parseBindingList(_tokentype.types.bracketR,true,true);return this.finishNode(node,"ArrayPattern");case _tokentype.types.braceL:return this.parseObj(true);default:this.unexpected();}};pp.parseBindingList=function(close,allowEmpty,allowTrailingComma,allowNonIdent){var elts=[],first=true;while(!this.eat(close)){if(first)first=false;else this.expect(_tokentype.types.comma);if(allowEmpty&&this.type===_tokentype.types.comma){elts.push(null);}else if(allowTrailingComma&&this.afterTrailingComma(close)){break;}else if(this.type===_tokentype.types.ellipsis){var rest=this.parseRest(allowNonIdent);this.parseBindingListItem(rest);elts.push(rest);this.expect(close);break;}else {var elem=this.parseMaybeDefault(this.start,this.startLoc);this.parseBindingListItem(elem);elts.push(elem);}}return elts;};pp.parseBindingListItem=function(param){return param;}; // Parses assignment pattern around given atom if possible.
pp.parseMaybeDefault=function(startPos,startLoc,left){left=left||this.parseBindingAtom();if(this.options.ecmaVersion<6||!this.eat(_tokentype.types.eq))return left;var node=this.startNodeAt(startPos,startLoc);node.left=left;node.right=this.parseMaybeAssign();return this.finishNode(node,"AssignmentPattern");}; // Verify that a node is an lval — something that can be assigned
// to.
pp.checkLVal=function(expr,isBinding,checkClashes){switch(expr.type){case "Identifier":if(this.strict&&this.reservedWordsStrictBind.test(expr.name))this.raise(expr.start,(isBinding?"Binding ":"Assigning to ")+expr.name+" in strict mode");if(checkClashes){if(_util.has(checkClashes,expr.name))this.raise(expr.start,"Argument name clash");checkClashes[expr.name]=true;}break;case "MemberExpression":if(isBinding)this.raise(expr.start,(isBinding?"Binding":"Assigning to")+" member expression");break;case "ObjectPattern":for(var i=0;i<expr.properties.length;i++){this.checkLVal(expr.properties[i].value,isBinding,checkClashes);}break;case "ArrayPattern":for(var i=0;i<expr.elements.length;i++){var elem=expr.elements[i];if(elem)this.checkLVal(elem,isBinding,checkClashes);}break;case "AssignmentPattern":this.checkLVal(expr.left,isBinding,checkClashes);break;case "RestElement":this.checkLVal(expr.argument,isBinding,checkClashes);break;case "ParenthesizedExpression":this.checkLVal(expr.expression,isBinding,checkClashes);break;default:this.raise(expr.start,(isBinding?"Binding":"Assigning to")+" rvalue");}};},{"./state":10,"./tokentype":14,"./util":15}],7:[function(_dereq_,module,exports){"use strict";exports.__esModule=true;function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var _state=_dereq_("./state");var _locutil=_dereq_("./locutil");var Node=function Node(parser,pos,loc){_classCallCheck(this,Node);this.type="";this.start=pos;this.end=0;if(parser.options.locations)this.loc=new _locutil.SourceLocation(parser,loc);if(parser.options.directSourceFile)this.sourceFile=parser.options.directSourceFile;if(parser.options.ranges)this.range=[pos,0];} // Start an AST node, attaching a start offset.
;exports.Node=Node;var pp=_state.Parser.prototype;pp.startNode=function(){return new Node(this,this.start,this.startLoc);};pp.startNodeAt=function(pos,loc){return new Node(this,pos,loc);}; // Finish an AST node, adding `type` and `end` properties.
function finishNodeAt(node,type,pos,loc){node.type=type;node.end=pos;if(this.options.locations)node.loc.end=loc;if(this.options.ranges)node.range[1]=pos;return node;}pp.finishNode=function(node,type){return finishNodeAt.call(this,node,type,this.lastTokEnd,this.lastTokEndLoc);}; // Finish node at given position
pp.finishNodeAt=function(node,type,pos,loc){return finishNodeAt.call(this,node,type,pos,loc);};},{"./locutil":5,"./state":10}],8:[function(_dereq_,module,exports){"use strict";exports.__esModule=true;exports.getOptions=getOptions;var _util=_dereq_("./util");var _locutil=_dereq_("./locutil"); // A second optional argument can be given to further configure
// the parser process. These options are recognized:
var defaultOptions={ // `ecmaVersion` indicates the ECMAScript version to parse. Must
// be either 3, or 5, or 6. This influences support for strict
// mode, the set of reserved words, support for getters and
// setters and other features.
ecmaVersion:5, // Source type ("script" or "module") for different semantics
sourceType:"script", // `onInsertedSemicolon` can be a callback that will be called
// when a semicolon is automatically inserted. It will be passed
// th position of the comma as an offset, and if `locations` is
// enabled, it is given the location as a `{line, column}` object
// as second argument.
onInsertedSemicolon:null, // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
// trailing commas.
onTrailingComma:null, // By default, reserved words are only enforced if ecmaVersion >= 5.
// Set `allowReserved` to a boolean value to explicitly turn this on
// an off. When this option has the value "never", reserved words
// and keywords can also not be used as property names.
allowReserved:null, // When enabled, a return at the top level is not considered an
// error.
allowReturnOutsideFunction:false, // When enabled, import/export statements are not constrained to
// appearing at the top of the program.
allowImportExportEverywhere:false, // When enabled, hashbang directive in the beginning of file
// is allowed and treated as a line comment.
allowHashBang:false, // When `locations` is on, `loc` properties holding objects with
// `start` and `end` properties in `{line, column}` form (with
// line being 1-based and column 0-based) will be attached to the
// nodes.
locations:false, // A function can be passed as `onToken` option, which will
// cause Acorn to call that function with object in the same
// format as tokens returned from `tokenizer().getToken()`. Note
// that you are not allowed to call the parser from the
// callback—that will corrupt its internal state.
onToken:null, // A function can be passed as `onComment` option, which will
// cause Acorn to call that function with `(block, text, start,
// end)` parameters whenever a comment is skipped. `block` is a
// boolean indicating whether this is a block (`/* */`) comment,
// `text` is the content of the comment, and `start` and `end` are
// character offsets that denote the start and end of the comment.
// When the `locations` option is on, two more parameters are
// passed, the full `{line, column}` locations of the start and
// end of the comments. Note that you are not allowed to call the
// parser from the callback—that will corrupt its internal state.
onComment:null, // Nodes have their start and end characters offsets recorded in
// `start` and `end` properties (directly on the node, rather than
// the `loc` object, which holds line/column data. To also add a
// [semi-standardized][range] `range` property holding a `[start,
// end]` array with the same numbers, set the `ranges` option to
// `true`.
//
// [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
ranges:false, // It is possible to parse multiple files into a single AST by
// passing the tree produced by parsing the first file as
// `program` option in subsequent parses. This will add the
// toplevel forms of the parsed file to the `Program` (top) node
// of an existing parse tree.
program:null, // When `locations` is on, you can pass this to record the source
// file in every node's `loc` object.
sourceFile:null, // This value, if given, is stored in every node, whether
// `locations` is on or off.
directSourceFile:null, // When enabled, parenthesized expressions are represented by
// (non-standard) ParenthesizedExpression nodes
preserveParens:false,plugins:{}};exports.defaultOptions=defaultOptions; // Interpret and default an options object
function getOptions(opts){var options={};for(var opt in defaultOptions){options[opt]=opts&&_util.has(opts,opt)?opts[opt]:defaultOptions[opt];}if(options.allowReserved==null)options.allowReserved=options.ecmaVersion<5;if(_util.isArray(options.onToken)){(function(){var tokens=options.onToken;options.onToken=function(token){return tokens.push(token);};})();}if(_util.isArray(options.onComment))options.onComment=pushComment(options,options.onComment);return options;}function pushComment(options,array){return function(block,text,start,end,startLoc,endLoc){var comment={type:block?'Block':'Line',value:text,start:start,end:end};if(options.locations)comment.loc=new _locutil.SourceLocation(this,startLoc,endLoc);if(options.ranges)comment.range=[start,end];array.push(comment);};}},{"./locutil":5,"./util":15}],9:[function(_dereq_,module,exports){"use strict";var _tokentype=_dereq_("./tokentype");var _state=_dereq_("./state");var _whitespace=_dereq_("./whitespace");var pp=_state.Parser.prototype; // ## Parser utilities
// Test whether a statement node is the string literal `"use strict"`.
pp.isUseStrict=function(stmt){return this.options.ecmaVersion>=5&&stmt.type==="ExpressionStatement"&&stmt.expression.type==="Literal"&&stmt.expression.raw.slice(1,-1)==="use strict";}; // Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.
pp.eat=function(type){if(this.type===type){this.next();return true;}else {return false;}}; // Tests whether parsed token is a contextual keyword.
pp.isContextual=function(name){return this.type===_tokentype.types.name&&this.value===name;}; // Consumes contextual keyword if possible.
pp.eatContextual=function(name){return this.value===name&&this.eat(_tokentype.types.name);}; // Asserts that following token is given contextual keyword.
pp.expectContextual=function(name){if(!this.eatContextual(name))this.unexpected();}; // Test whether a semicolon can be inserted at the current position.
pp.canInsertSemicolon=function(){return this.type===_tokentype.types.eof||this.type===_tokentype.types.braceR||_whitespace.lineBreak.test(this.input.slice(this.lastTokEnd,this.start));};pp.insertSemicolon=function(){if(this.canInsertSemicolon()){if(this.options.onInsertedSemicolon)this.options.onInsertedSemicolon(this.lastTokEnd,this.lastTokEndLoc);return true;}}; // Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.
pp.semicolon=function(){if(!this.eat(_tokentype.types.semi)&&!this.insertSemicolon())this.unexpected();};pp.afterTrailingComma=function(tokType){if(this.type==tokType){if(this.options.onTrailingComma)this.options.onTrailingComma(this.lastTokStart,this.lastTokStartLoc);this.next();return true;}}; // Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.
pp.expect=function(type){this.eat(type)||this.unexpected();}; // Raise an unexpected token error.
pp.unexpected=function(pos){this.raise(pos!=null?pos:this.start,"Unexpected token");};pp.checkPatternErrors=function(refDestructuringErrors,andThrow){var pos=refDestructuringErrors&&refDestructuringErrors.trailingComma;if(!andThrow)return !!pos;if(pos)this.raise(pos,"Trailing comma is not permitted in destructuring patterns");};pp.checkExpressionErrors=function(refDestructuringErrors,andThrow){var pos=refDestructuringErrors&&refDestructuringErrors.shorthandAssign;if(!andThrow)return !!pos;if(pos)this.raise(pos,"Shorthand property assignments are valid only in destructuring patterns");};},{"./state":10,"./tokentype":14,"./whitespace":16}],10:[function(_dereq_,module,exports){"use strict";exports.__esModule=true;function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var _identifier=_dereq_("./identifier");var _tokentype=_dereq_("./tokentype");var _whitespace=_dereq_("./whitespace");var _options=_dereq_("./options"); // Registered plugins
var plugins={};exports.plugins=plugins;function keywordRegexp(words){return new RegExp("^("+words.replace(/ /g,"|")+")$");}var Parser=function(){function Parser(options,input,startPos){_classCallCheck(this,Parser);this.options=options=_options.getOptions(options);this.sourceFile=options.sourceFile;this.keywords=keywordRegexp(_identifier.keywords[options.ecmaVersion>=6?6:5]);var reserved=options.allowReserved?"":_identifier.reservedWords[options.ecmaVersion]+(options.sourceType=="module"?" await":"");this.reservedWords=keywordRegexp(reserved);var reservedStrict=(reserved?reserved+" ":"")+_identifier.reservedWords.strict;this.reservedWordsStrict=keywordRegexp(reservedStrict);this.reservedWordsStrictBind=keywordRegexp(reservedStrict+" "+_identifier.reservedWords.strictBind);this.input=String(input); // Used to signal to callers of `readWord1` whether the word
// contained any escape sequences. This is needed because words with
// escape sequences must not be interpreted as keywords.
this.containsEsc=false; // Load plugins
this.loadPlugins(options.plugins); // Set up token state
// The current position of the tokenizer in the input.
if(startPos){this.pos=startPos;this.lineStart=Math.max(0,this.input.lastIndexOf("\n",startPos));this.curLine=this.input.slice(0,this.lineStart).split(_whitespace.lineBreak).length;}else {this.pos=this.lineStart=0;this.curLine=1;} // Properties of the current token:
// Its type
this.type=_tokentype.types.eof; // For tokens that include more information than their type, the value
this.value=null; // Its start and end offset
this.start=this.end=this.pos; // And, if locations are used, the {line, column} object
// corresponding to those offsets
this.startLoc=this.endLoc=this.curPosition(); // Position information for the previous token
this.lastTokEndLoc=this.lastTokStartLoc=null;this.lastTokStart=this.lastTokEnd=this.pos; // The context stack is used to superficially track syntactic
// context to predict whether a regular expression is allowed in a
// given position.
this.context=this.initialContext();this.exprAllowed=true; // Figure out if it's a module code.
this.strict=this.inModule=options.sourceType==="module"; // Used to signify the start of a potential arrow function
this.potentialArrowAt=-1; // Flags to track whether we are in a function, a generator.
this.inFunction=this.inGenerator=false; // Labels in scope.
this.labels=[]; // If enabled, skip leading hashbang line.
if(this.pos===0&&options.allowHashBang&&this.input.slice(0,2)==='#!')this.skipLineComment(2);} // DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
Parser.prototype.isKeyword=function isKeyword(word){return this.keywords.test(word);};Parser.prototype.isReservedWord=function isReservedWord(word){return this.reservedWords.test(word);};Parser.prototype.extend=function extend(name,f){this[name]=f(this[name]);};Parser.prototype.loadPlugins=function loadPlugins(pluginConfigs){for(var _name in pluginConfigs){var plugin=plugins[_name];if(!plugin)throw new Error("Plugin '"+_name+"' not found");plugin(this,pluginConfigs[_name]);}};Parser.prototype.parse=function parse(){var node=this.options.program||this.startNode();this.nextToken();return this.parseTopLevel(node);};return Parser;}();exports.Parser=Parser;},{"./identifier":2,"./options":8,"./tokentype":14,"./whitespace":16}],11:[function(_dereq_,module,exports){"use strict";var _tokentype=_dereq_("./tokentype");var _state=_dereq_("./state");var _whitespace=_dereq_("./whitespace");var pp=_state.Parser.prototype; // ### Statement parsing
// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.
pp.parseTopLevel=function(node){var first=true;if(!node.body)node.body=[];while(this.type!==_tokentype.types.eof){var stmt=this.parseStatement(true,true);node.body.push(stmt);if(first){if(this.isUseStrict(stmt))this.setStrict(true);first=false;}}this.next();if(this.options.ecmaVersion>=6){node.sourceType=this.options.sourceType;}return this.finishNode(node,"Program");};var loopLabel={kind:"loop"},switchLabel={kind:"switch"}; // Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.
pp.parseStatement=function(declaration,topLevel){var starttype=this.type,node=this.startNode(); // Most types of statements are recognized by the keyword they
// start with. Many are trivial to parse, some require a bit of
// complexity.
switch(starttype){case _tokentype.types._break:case _tokentype.types._continue:return this.parseBreakContinueStatement(node,starttype.keyword);case _tokentype.types._debugger:return this.parseDebuggerStatement(node);case _tokentype.types._do:return this.parseDoStatement(node);case _tokentype.types._for:return this.parseForStatement(node);case _tokentype.types._function:if(!declaration&&this.options.ecmaVersion>=6)this.unexpected();return this.parseFunctionStatement(node);case _tokentype.types._class:if(!declaration)this.unexpected();return this.parseClass(node,true);case _tokentype.types._if:return this.parseIfStatement(node);case _tokentype.types._return:return this.parseReturnStatement(node);case _tokentype.types._switch:return this.parseSwitchStatement(node);case _tokentype.types._throw:return this.parseThrowStatement(node);case _tokentype.types._try:return this.parseTryStatement(node);case _tokentype.types._let:case _tokentype.types._const:if(!declaration)this.unexpected(); // NOTE: falls through to _var
case _tokentype.types._var:return this.parseVarStatement(node,starttype);case _tokentype.types._while:return this.parseWhileStatement(node);case _tokentype.types._with:return this.parseWithStatement(node);case _tokentype.types.braceL:return this.parseBlock();case _tokentype.types.semi:return this.parseEmptyStatement(node);case _tokentype.types._export:case _tokentype.types._import:if(!this.options.allowImportExportEverywhere){if(!topLevel)this.raise(this.start,"'import' and 'export' may only appear at the top level");if(!this.inModule)this.raise(this.start,"'import' and 'export' may appear only with 'sourceType: module'");}return starttype===_tokentype.types._import?this.parseImport(node):this.parseExport(node); // If the statement does not start with a statement keyword or a
// brace, it's an ExpressionStatement or LabeledStatement. We
// simply start parsing an expression, and afterwards, if the
// next token is a colon and the expression was a simple
// Identifier node, we switch to interpreting it as a label.
default:var maybeName=this.value,expr=this.parseExpression();if(starttype===_tokentype.types.name&&expr.type==="Identifier"&&this.eat(_tokentype.types.colon))return this.parseLabeledStatement(node,maybeName,expr);else return this.parseExpressionStatement(node,expr);}};pp.parseBreakContinueStatement=function(node,keyword){var isBreak=keyword=="break";this.next();if(this.eat(_tokentype.types.semi)||this.insertSemicolon())node.label=null;else if(this.type!==_tokentype.types.name)this.unexpected();else {node.label=this.parseIdent();this.semicolon();} // Verify that there is an actual destination to break or
// continue to.
for(var i=0;i<this.labels.length;++i){var lab=this.labels[i];if(node.label==null||lab.name===node.label.name){if(lab.kind!=null&&(isBreak||lab.kind==="loop"))break;if(node.label&&isBreak)break;}}if(i===this.labels.length)this.raise(node.start,"Unsyntactic "+keyword);return this.finishNode(node,isBreak?"BreakStatement":"ContinueStatement");};pp.parseDebuggerStatement=function(node){this.next();this.semicolon();return this.finishNode(node,"DebuggerStatement");};pp.parseDoStatement=function(node){this.next();this.labels.push(loopLabel);node.body=this.parseStatement(false);this.labels.pop();this.expect(_tokentype.types._while);node.test=this.parseParenExpression();if(this.options.ecmaVersion>=6)this.eat(_tokentype.types.semi);else this.semicolon();return this.finishNode(node,"DoWhileStatement");}; // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.
pp.parseForStatement=function(node){this.next();this.labels.push(loopLabel);this.expect(_tokentype.types.parenL);if(this.type===_tokentype.types.semi)return this.parseFor(node,null);if(this.type===_tokentype.types._var||this.type===_tokentype.types._let||this.type===_tokentype.types._const){var _init=this.startNode(),varKind=this.type;this.next();this.parseVar(_init,true,varKind);this.finishNode(_init,"VariableDeclaration");if((this.type===_tokentype.types._in||this.options.ecmaVersion>=6&&this.isContextual("of"))&&_init.declarations.length===1&&!(varKind!==_tokentype.types._var&&_init.declarations[0].init))return this.parseForIn(node,_init);return this.parseFor(node,_init);}var refDestructuringErrors={shorthandAssign:0,trailingComma:0};var init=this.parseExpression(true,refDestructuringErrors);if(this.type===_tokentype.types._in||this.options.ecmaVersion>=6&&this.isContextual("of")){this.checkPatternErrors(refDestructuringErrors,true);this.toAssignable(init);this.checkLVal(init);return this.parseForIn(node,init);}else {this.checkExpressionErrors(refDestructuringErrors,true);}return this.parseFor(node,init);};pp.parseFunctionStatement=function(node){this.next();return this.parseFunction(node,true);};pp.parseIfStatement=function(node){this.next();node.test=this.parseParenExpression();node.consequent=this.parseStatement(false);node.alternate=this.eat(_tokentype.types._else)?this.parseStatement(false):null;return this.finishNode(node,"IfStatement");};pp.parseReturnStatement=function(node){if(!this.inFunction&&!this.options.allowReturnOutsideFunction)this.raise(this.start,"'return' outside of function");this.next(); // In `return` (and `break`/`continue`), the keywords with
// optional arguments, we eagerly look for a semicolon or the
// possibility to insert one.
if(this.eat(_tokentype.types.semi)||this.insertSemicolon())node.argument=null;else {node.argument=this.parseExpression();this.semicolon();}return this.finishNode(node,"ReturnStatement");};pp.parseSwitchStatement=function(node){this.next();node.discriminant=this.parseParenExpression();node.cases=[];this.expect(_tokentype.types.braceL);this.labels.push(switchLabel); // Statements under must be grouped (by label) in SwitchCase
// nodes. `cur` is used to keep the node that we are currently
// adding statements to.
for(var cur,sawDefault=false;this.type!=_tokentype.types.braceR;){if(this.type===_tokentype.types._case||this.type===_tokentype.types._default){var isCase=this.type===_tokentype.types._case;if(cur)this.finishNode(cur,"SwitchCase");node.cases.push(cur=this.startNode());cur.consequent=[];this.next();if(isCase){cur.test=this.parseExpression();}else {if(sawDefault)this.raise(this.lastTokStart,"Multiple default clauses");sawDefault=true;cur.test=null;}this.expect(_tokentype.types.colon);}else {if(!cur)this.unexpected();cur.consequent.push(this.parseStatement(true));}}if(cur)this.finishNode(cur,"SwitchCase");this.next(); // Closing brace
this.labels.pop();return this.finishNode(node,"SwitchStatement");};pp.parseThrowStatement=function(node){this.next();if(_whitespace.lineBreak.test(this.input.slice(this.lastTokEnd,this.start)))this.raise(this.lastTokEnd,"Illegal newline after throw");node.argument=this.parseExpression();this.semicolon();return this.finishNode(node,"ThrowStatement");}; // Reused empty array added for node fields that are always empty.
var empty=[];pp.parseTryStatement=function(node){this.next();node.block=this.parseBlock();node.handler=null;if(this.type===_tokentype.types._catch){var clause=this.startNode();this.next();this.expect(_tokentype.types.parenL);clause.param=this.parseBindingAtom();this.checkLVal(clause.param,true);this.expect(_tokentype.types.parenR);clause.body=this.parseBlock();node.handler=this.finishNode(clause,"CatchClause");}node.finalizer=this.eat(_tokentype.types._finally)?this.parseBlock():null;if(!node.handler&&!node.finalizer)this.raise(node.start,"Missing catch or finally clause");return this.finishNode(node,"TryStatement");};pp.parseVarStatement=function(node,kind){this.next();this.parseVar(node,false,kind);this.semicolon();return this.finishNode(node,"VariableDeclaration");};pp.parseWhileStatement=function(node){this.next();node.test=this.parseParenExpression();this.labels.push(loopLabel);node.body=this.parseStatement(false);this.labels.pop();return this.finishNode(node,"WhileStatement");};pp.parseWithStatement=function(node){if(this.strict)this.raise(this.start,"'with' in strict mode");this.next();node.object=this.parseParenExpression();node.body=this.parseStatement(false);return this.finishNode(node,"WithStatement");};pp.parseEmptyStatement=function(node){this.next();return this.finishNode(node,"EmptyStatement");};pp.parseLabeledStatement=function(node,maybeName,expr){for(var i=0;i<this.labels.length;++i){if(this.labels[i].name===maybeName)this.raise(expr.start,"Label '"+maybeName+"' is already declared");}var kind=this.type.isLoop?"loop":this.type===_tokentype.types._switch?"switch":null;for(var i=this.labels.length-1;i>=0;i--){var label=this.labels[i];if(label.statementStart==node.start){label.statementStart=this.start;label.kind=kind;}else break;}this.labels.push({name:maybeName,kind:kind,statementStart:this.start});node.body=this.parseStatement(true);this.labels.pop();node.label=expr;return this.finishNode(node,"LabeledStatement");};pp.parseExpressionStatement=function(node,expr){node.expression=expr;this.semicolon();return this.finishNode(node,"ExpressionStatement");}; // Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).
pp.parseBlock=function(allowStrict){var node=this.startNode(),first=true,oldStrict=undefined;node.body=[];this.expect(_tokentype.types.braceL);while(!this.eat(_tokentype.types.braceR)){var stmt=this.parseStatement(true);node.body.push(stmt);if(first&&allowStrict&&this.isUseStrict(stmt)){oldStrict=this.strict;this.setStrict(this.strict=true);}first=false;}if(oldStrict===false)this.setStrict(false);return this.finishNode(node,"BlockStatement");}; // Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.
pp.parseFor=function(node,init){node.init=init;this.expect(_tokentype.types.semi);node.test=this.type===_tokentype.types.semi?null:this.parseExpression();this.expect(_tokentype.types.semi);node.update=this.type===_tokentype.types.parenR?null:this.parseExpression();this.expect(_tokentype.types.parenR);node.body=this.parseStatement(false);this.labels.pop();return this.finishNode(node,"ForStatement");}; // Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.
pp.parseForIn=function(node,init){var type=this.type===_tokentype.types._in?"ForInStatement":"ForOfStatement";this.next();node.left=init;node.right=this.parseExpression();this.expect(_tokentype.types.parenR);node.body=this.parseStatement(false);this.labels.pop();return this.finishNode(node,type);}; // Parse a list of variable declarations.
pp.parseVar=function(node,isFor,kind){node.declarations=[];node.kind=kind.keyword;for(;;){var decl=this.startNode();this.parseVarId(decl);if(this.eat(_tokentype.types.eq)){decl.init=this.parseMaybeAssign(isFor);}else if(kind===_tokentype.types._const&&!(this.type===_tokentype.types._in||this.options.ecmaVersion>=6&&this.isContextual("of"))){this.unexpected();}else if(decl.id.type!="Identifier"&&!(isFor&&(this.type===_tokentype.types._in||this.isContextual("of")))){this.raise(this.lastTokEnd,"Complex binding patterns require an initialization value");}else {decl.init=null;}node.declarations.push(this.finishNode(decl,"VariableDeclarator"));if(!this.eat(_tokentype.types.comma))break;}return node;};pp.parseVarId=function(decl){decl.id=this.parseBindingAtom();this.checkLVal(decl.id,true);}; // Parse a function declaration or literal (depending on the
// `isStatement` parameter).
pp.parseFunction=function(node,isStatement,allowExpressionBody){this.initFunction(node);if(this.options.ecmaVersion>=6)node.generator=this.eat(_tokentype.types.star);if(isStatement||this.type===_tokentype.types.name)node.id=this.parseIdent();this.parseFunctionParams(node);this.parseFunctionBody(node,allowExpressionBody);return this.finishNode(node,isStatement?"FunctionDeclaration":"FunctionExpression");};pp.parseFunctionParams=function(node){this.expect(_tokentype.types.parenL);node.params=this.parseBindingList(_tokentype.types.parenR,false,false,true);}; // Parse a class declaration or literal (depending on the
// `isStatement` parameter).
pp.parseClass=function(node,isStatement){this.next();this.parseClassId(node,isStatement);this.parseClassSuper(node);var classBody=this.startNode();var hadConstructor=false;classBody.body=[];this.expect(_tokentype.types.braceL);while(!this.eat(_tokentype.types.braceR)){if(this.eat(_tokentype.types.semi))continue;var method=this.startNode();var isGenerator=this.eat(_tokentype.types.star);var isMaybeStatic=this.type===_tokentype.types.name&&this.value==="static";this.parsePropertyName(method);method["static"]=isMaybeStatic&&this.type!==_tokentype.types.parenL;if(method["static"]){if(isGenerator)this.unexpected();isGenerator=this.eat(_tokentype.types.star);this.parsePropertyName(method);}method.kind="method";var isGetSet=false;if(!method.computed){var key=method.key;if(!isGenerator&&key.type==="Identifier"&&this.type!==_tokentype.types.parenL&&(key.name==="get"||key.name==="set")){isGetSet=true;method.kind=key.name;key=this.parsePropertyName(method);}if(!method["static"]&&(key.type==="Identifier"&&key.name==="constructor"||key.type==="Literal"&&key.value==="constructor")){if(hadConstructor)this.raise(key.start,"Duplicate constructor in the same class");if(isGetSet)this.raise(key.start,"Constructor can't have get/set modifier");if(isGenerator)this.raise(key.start,"Constructor can't be a generator");method.kind="constructor";hadConstructor=true;}}this.parseClassMethod(classBody,method,isGenerator);if(isGetSet){var paramCount=method.kind==="get"?0:1;if(method.value.params.length!==paramCount){var start=method.value.start;if(method.kind==="get")this.raise(start,"getter should have no params");else this.raise(start,"setter should have exactly one param");}if(method.kind==="set"&&method.value.params[0].type==="RestElement")this.raise(method.value.params[0].start,"Setter cannot use rest params");}}node.body=this.finishNode(classBody,"ClassBody");return this.finishNode(node,isStatement?"ClassDeclaration":"ClassExpression");};pp.parseClassMethod=function(classBody,method,isGenerator){method.value=this.parseMethod(isGenerator);classBody.body.push(this.finishNode(method,"MethodDefinition"));};pp.parseClassId=function(node,isStatement){node.id=this.type===_tokentype.types.name?this.parseIdent():isStatement?this.unexpected():null;};pp.parseClassSuper=function(node){node.superClass=this.eat(_tokentype.types._extends)?this.parseExprSubscripts():null;}; // Parses module export declaration.
pp.parseExport=function(node){this.next(); // export * from '...'
if(this.eat(_tokentype.types.star)){this.expectContextual("from");node.source=this.type===_tokentype.types.string?this.parseExprAtom():this.unexpected();this.semicolon();return this.finishNode(node,"ExportAllDeclaration");}if(this.eat(_tokentype.types._default)){ // export default ...
var expr=this.parseMaybeAssign();var needsSemi=true;if(expr.type=="FunctionExpression"||expr.type=="ClassExpression"){needsSemi=false;if(expr.id){expr.type=expr.type=="FunctionExpression"?"FunctionDeclaration":"ClassDeclaration";}}node.declaration=expr;if(needsSemi)this.semicolon();return this.finishNode(node,"ExportDefaultDeclaration");} // export var|const|let|function|class ...
if(this.shouldParseExportStatement()){node.declaration=this.parseStatement(true);node.specifiers=[];node.source=null;}else { // export { x, y as z } [from '...']
node.declaration=null;node.specifiers=this.parseExportSpecifiers();if(this.eatContextual("from")){node.source=this.type===_tokentype.types.string?this.parseExprAtom():this.unexpected();}else { // check for keywords used as local names
for(var i=0;i<node.specifiers.length;i++){if(this.keywords.test(node.specifiers[i].local.name)||this.reservedWords.test(node.specifiers[i].local.name)){this.unexpected(node.specifiers[i].local.start);}}node.source=null;}this.semicolon();}return this.finishNode(node,"ExportNamedDeclaration");};pp.shouldParseExportStatement=function(){return this.type.keyword;}; // Parses a comma-separated list of module exports.
pp.parseExportSpecifiers=function(){var nodes=[],first=true; // export { x, y as z } [from '...']
this.expect(_tokentype.types.braceL);while(!this.eat(_tokentype.types.braceR)){if(!first){this.expect(_tokentype.types.comma);if(this.afterTrailingComma(_tokentype.types.braceR))break;}else first=false;var node=this.startNode();node.local=this.parseIdent(this.type===_tokentype.types._default);node.exported=this.eatContextual("as")?this.parseIdent(true):node.local;nodes.push(this.finishNode(node,"ExportSpecifier"));}return nodes;}; // Parses import declaration.
pp.parseImport=function(node){this.next(); // import '...'
if(this.type===_tokentype.types.string){node.specifiers=empty;node.source=this.parseExprAtom();}else {node.specifiers=this.parseImportSpecifiers();this.expectContextual("from");node.source=this.type===_tokentype.types.string?this.parseExprAtom():this.unexpected();}this.semicolon();return this.finishNode(node,"ImportDeclaration");}; // Parses a comma-separated list of module imports.
pp.parseImportSpecifiers=function(){var nodes=[],first=true;if(this.type===_tokentype.types.name){ // import defaultObj, { x, y as z } from '...'
var node=this.startNode();node.local=this.parseIdent();this.checkLVal(node.local,true);nodes.push(this.finishNode(node,"ImportDefaultSpecifier"));if(!this.eat(_tokentype.types.comma))return nodes;}if(this.type===_tokentype.types.star){var node=this.startNode();this.next();this.expectContextual("as");node.local=this.parseIdent();this.checkLVal(node.local,true);nodes.push(this.finishNode(node,"ImportNamespaceSpecifier"));return nodes;}this.expect(_tokentype.types.braceL);while(!this.eat(_tokentype.types.braceR)){if(!first){this.expect(_tokentype.types.comma);if(this.afterTrailingComma(_tokentype.types.braceR))break;}else first=false;var node=this.startNode();node.imported=this.parseIdent(true);if(this.eatContextual("as")){node.local=this.parseIdent();}else {node.local=node.imported;if(this.isKeyword(node.local.name))this.unexpected(node.local.start);if(this.reservedWordsStrict.test(node.local.name))this.raise(node.local.start,"The keyword '"+node.local.name+"' is reserved");}this.checkLVal(node.local,true);nodes.push(this.finishNode(node,"ImportSpecifier"));}return nodes;};},{"./state":10,"./tokentype":14,"./whitespace":16}],12:[function(_dereq_,module,exports){ // The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design
"use strict";exports.__esModule=true;function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var _state=_dereq_("./state");var _tokentype=_dereq_("./tokentype");var _whitespace=_dereq_("./whitespace");var TokContext=function TokContext(token,isExpr,preserveSpace,override){_classCallCheck(this,TokContext);this.token=token;this.isExpr=!!isExpr;this.preserveSpace=!!preserveSpace;this.override=override;};exports.TokContext=TokContext;var types={b_stat:new TokContext("{",false),b_expr:new TokContext("{",true),b_tmpl:new TokContext("${",true),p_stat:new TokContext("(",false),p_expr:new TokContext("(",true),q_tmpl:new TokContext("`",true,true,function(p){return p.readTmplToken();}),f_expr:new TokContext("function",true)};exports.types=types;var pp=_state.Parser.prototype;pp.initialContext=function(){return [types.b_stat];};pp.braceIsBlock=function(prevType){if(prevType===_tokentype.types.colon){var _parent=this.curContext();if(_parent===types.b_stat||_parent===types.b_expr)return !_parent.isExpr;}if(prevType===_tokentype.types._return)return _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd,this.start));if(prevType===_tokentype.types._else||prevType===_tokentype.types.semi||prevType===_tokentype.types.eof||prevType===_tokentype.types.parenR)return true;if(prevType==_tokentype.types.braceL)return this.curContext()===types.b_stat;return !this.exprAllowed;};pp.updateContext=function(prevType){var update=undefined,type=this.type;if(type.keyword&&prevType==_tokentype.types.dot)this.exprAllowed=false;else if(update=type.updateContext)update.call(this,prevType);else this.exprAllowed=type.beforeExpr;}; // Token-specific context update code
_tokentype.types.parenR.updateContext=_tokentype.types.braceR.updateContext=function(){if(this.context.length==1){this.exprAllowed=true;return;}var out=this.context.pop();if(out===types.b_stat&&this.curContext()===types.f_expr){this.context.pop();this.exprAllowed=false;}else if(out===types.b_tmpl){this.exprAllowed=true;}else {this.exprAllowed=!out.isExpr;}};_tokentype.types.braceL.updateContext=function(prevType){this.context.push(this.braceIsBlock(prevType)?types.b_stat:types.b_expr);this.exprAllowed=true;};_tokentype.types.dollarBraceL.updateContext=function(){this.context.push(types.b_tmpl);this.exprAllowed=true;};_tokentype.types.parenL.updateContext=function(prevType){var statementParens=prevType===_tokentype.types._if||prevType===_tokentype.types._for||prevType===_tokentype.types._with||prevType===_tokentype.types._while;this.context.push(statementParens?types.p_stat:types.p_expr);this.exprAllowed=true;};_tokentype.types.incDec.updateContext=function(){ // tokExprAllowed stays unchanged
};_tokentype.types._function.updateContext=function(){if(this.curContext()!==types.b_stat)this.context.push(types.f_expr);this.exprAllowed=false;};_tokentype.types.backQuote.updateContext=function(){if(this.curContext()===types.q_tmpl)this.context.pop();else this.context.push(types.q_tmpl);this.exprAllowed=false;};},{"./state":10,"./tokentype":14,"./whitespace":16}],13:[function(_dereq_,module,exports){"use strict";exports.__esModule=true;function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var _identifier=_dereq_("./identifier");var _tokentype=_dereq_("./tokentype");var _state=_dereq_("./state");var _locutil=_dereq_("./locutil");var _whitespace=_dereq_("./whitespace"); // Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.
var Token=function Token(p){_classCallCheck(this,Token);this.type=p.type;this.value=p.value;this.start=p.start;this.end=p.end;if(p.options.locations)this.loc=new _locutil.SourceLocation(p,p.startLoc,p.endLoc);if(p.options.ranges)this.range=[p.start,p.end];} // ## Tokenizer
;exports.Token=Token;var pp=_state.Parser.prototype; // Are we running under Rhino?
var isRhino=(typeof Packages==="undefined"?"undefined":_typeof(Packages))=="object"&&Object.prototype.toString.call(Packages)=="[object JavaPackage]"; // Move to the next token
pp.next=function(){if(this.options.onToken)this.options.onToken(new Token(this));this.lastTokEnd=this.end;this.lastTokStart=this.start;this.lastTokEndLoc=this.endLoc;this.lastTokStartLoc=this.startLoc;this.nextToken();};pp.getToken=function(){this.next();return new Token(this);}; // If we're in an ES6 environment, make parsers iterable
if(typeof Symbol!=="undefined")pp[Symbol.iterator]=function(){var self=this;return {next:function next(){var token=self.getToken();return {done:token.type===_tokentype.types.eof,value:token};}};}; // Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).
pp.setStrict=function(strict){this.strict=strict;if(this.type!==_tokentype.types.num&&this.type!==_tokentype.types.string)return;this.pos=this.start;if(this.options.locations){while(this.pos<this.lineStart){this.lineStart=this.input.lastIndexOf("\n",this.lineStart-2)+1;--this.curLine;}}this.nextToken();};pp.curContext=function(){return this.context[this.context.length-1];}; // Read a single token, updating the parser object's token-related
// properties.
pp.nextToken=function(){var curContext=this.curContext();if(!curContext||!curContext.preserveSpace)this.skipSpace();this.start=this.pos;if(this.options.locations)this.startLoc=this.curPosition();if(this.pos>=this.input.length)return this.finishToken(_tokentype.types.eof);if(curContext.override)return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());};pp.readToken=function(code){ // Identifier or keyword. '\uXXXX' sequences are allowed in
// identifiers, so '\' also dispatches to that.
if(_identifier.isIdentifierStart(code,this.options.ecmaVersion>=6)||code===92 /* '\' */)return this.readWord();return this.getTokenFromCode(code);};pp.fullCharCodeAtPos=function(){var code=this.input.charCodeAt(this.pos);if(code<=0xd7ff||code>=0xe000)return code;var next=this.input.charCodeAt(this.pos+1);return (code<<10)+next-0x35fdc00;};pp.skipBlockComment=function(){var startLoc=this.options.onComment&&this.curPosition();var start=this.pos,end=this.input.indexOf("*/",this.pos+=2);if(end===-1)this.raise(this.pos-2,"Unterminated comment");this.pos=end+2;if(this.options.locations){_whitespace.lineBreakG.lastIndex=start;var match=undefined;while((match=_whitespace.lineBreakG.exec(this.input))&&match.index<this.pos){++this.curLine;this.lineStart=match.index+match[0].length;}}if(this.options.onComment)this.options.onComment(true,this.input.slice(start+2,end),start,this.pos,startLoc,this.curPosition());};pp.skipLineComment=function(startSkip){var start=this.pos;var startLoc=this.options.onComment&&this.curPosition();var ch=this.input.charCodeAt(this.pos+=startSkip);while(this.pos<this.input.length&&ch!==10&&ch!==13&&ch!==8232&&ch!==8233){++this.pos;ch=this.input.charCodeAt(this.pos);}if(this.options.onComment)this.options.onComment(false,this.input.slice(start+startSkip,this.pos),start,this.pos,startLoc,this.curPosition());}; // Called at the start of the parse and after every token. Skips
// whitespace and comments, and.
pp.skipSpace=function(){loop: while(this.pos<this.input.length){var ch=this.input.charCodeAt(this.pos);switch(ch){case 32:case 160: // ' '
++this.pos;break;case 13:if(this.input.charCodeAt(this.pos+1)===10){++this.pos;}case 10:case 8232:case 8233:++this.pos;if(this.options.locations){++this.curLine;this.lineStart=this.pos;}break;case 47: // '/'
switch(this.input.charCodeAt(this.pos+1)){case 42: // '*'
this.skipBlockComment();break;case 47:this.skipLineComment(2);break;default:break loop;}break;default:if(ch>8&&ch<14||ch>=5760&&_whitespace.nonASCIIwhitespace.test(String.fromCharCode(ch))){++this.pos;}else {break loop;}}}}; // Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.
pp.finishToken=function(type,val){this.end=this.pos;if(this.options.locations)this.endLoc=this.curPosition();var prevType=this.type;this.type=type;this.value=val;this.updateContext(prevType);}; // ### Token reading
// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot=function(){var next=this.input.charCodeAt(this.pos+1);if(next>=48&&next<=57)return this.readNumber(true);var next2=this.input.charCodeAt(this.pos+2);if(this.options.ecmaVersion>=6&&next===46&&next2===46){ // 46 = dot '.'
this.pos+=3;return this.finishToken(_tokentype.types.ellipsis);}else {++this.pos;return this.finishToken(_tokentype.types.dot);}};pp.readToken_slash=function(){ // '/'
var next=this.input.charCodeAt(this.pos+1);if(this.exprAllowed){++this.pos;return this.readRegexp();}if(next===61)return this.finishOp(_tokentype.types.assign,2);return this.finishOp(_tokentype.types.slash,1);};pp.readToken_mult_modulo=function(code){ // '%*'
var next=this.input.charCodeAt(this.pos+1);if(next===61)return this.finishOp(_tokentype.types.assign,2);return this.finishOp(code===42?_tokentype.types.star:_tokentype.types.modulo,1);};pp.readToken_pipe_amp=function(code){ // '|&'
var next=this.input.charCodeAt(this.pos+1);if(next===code)return this.finishOp(code===124?_tokentype.types.logicalOR:_tokentype.types.logicalAND,2);if(next===61)return this.finishOp(_tokentype.types.assign,2);return this.finishOp(code===124?_tokentype.types.bitwiseOR:_tokentype.types.bitwiseAND,1);};pp.readToken_caret=function(){ // '^'
var next=this.input.charCodeAt(this.pos+1);if(next===61)return this.finishOp(_tokentype.types.assign,2);return this.finishOp(_tokentype.types.bitwiseXOR,1);};pp.readToken_plus_min=function(code){ // '+-'
var next=this.input.charCodeAt(this.pos+1);if(next===code){if(next==45&&this.input.charCodeAt(this.pos+2)==62&&_whitespace.lineBreak.test(this.input.slice(this.lastTokEnd,this.pos))){ // A `-->` line comment
this.skipLineComment(3);this.skipSpace();return this.nextToken();}return this.finishOp(_tokentype.types.incDec,2);}if(next===61)return this.finishOp(_tokentype.types.assign,2);return this.finishOp(_tokentype.types.plusMin,1);};pp.readToken_lt_gt=function(code){ // '<>'
var next=this.input.charCodeAt(this.pos+1);var size=1;if(next===code){size=code===62&&this.input.charCodeAt(this.pos+2)===62?3:2;if(this.input.charCodeAt(this.pos+size)===61)return this.finishOp(_tokentype.types.assign,size+1);return this.finishOp(_tokentype.types.bitShift,size);}if(next==33&&code==60&&this.input.charCodeAt(this.pos+2)==45&&this.input.charCodeAt(this.pos+3)==45){if(this.inModule)this.unexpected(); // `<!--`, an XML-style comment that should be interpreted as a line comment
this.skipLineComment(4);this.skipSpace();return this.nextToken();}if(next===61)size=this.input.charCodeAt(this.pos+2)===61?3:2;return this.finishOp(_tokentype.types.relational,size);};pp.readToken_eq_excl=function(code){ // '=!'
var next=this.input.charCodeAt(this.pos+1);if(next===61)return this.finishOp(_tokentype.types.equality,this.input.charCodeAt(this.pos+2)===61?3:2);if(code===61&&next===62&&this.options.ecmaVersion>=6){ // '=>'
this.pos+=2;return this.finishToken(_tokentype.types.arrow);}return this.finishOp(code===61?_tokentype.types.eq:_tokentype.types.prefix,1);};pp.getTokenFromCode=function(code){switch(code){ // The interpretation of a dot depends on whether it is followed
// by a digit or another two dots.
case 46: // '.'
return this.readToken_dot(); // Punctuation tokens.
case 40:++this.pos;return this.finishToken(_tokentype.types.parenL);case 41:++this.pos;return this.finishToken(_tokentype.types.parenR);case 59:++this.pos;return this.finishToken(_tokentype.types.semi);case 44:++this.pos;return this.finishToken(_tokentype.types.comma);case 91:++this.pos;return this.finishToken(_tokentype.types.bracketL);case 93:++this.pos;return this.finishToken(_tokentype.types.bracketR);case 123:++this.pos;return this.finishToken(_tokentype.types.braceL);case 125:++this.pos;return this.finishToken(_tokentype.types.braceR);case 58:++this.pos;return this.finishToken(_tokentype.types.colon);case 63:++this.pos;return this.finishToken(_tokentype.types.question);case 96: // '`'
if(this.options.ecmaVersion<6)break;++this.pos;return this.finishToken(_tokentype.types.backQuote);case 48: // '0'
var next=this.input.charCodeAt(this.pos+1);if(next===120||next===88)return this.readRadixNumber(16); // '0x', '0X' - hex number
if(this.options.ecmaVersion>=6){if(next===111||next===79)return this.readRadixNumber(8); // '0o', '0O' - octal number
if(next===98||next===66)return this.readRadixNumber(2); // '0b', '0B' - binary number
} // Anything else beginning with a digit is an integer, octal
// number, or float.
case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57: // 1-9
return this.readNumber(false); // Quotes produce strings.
case 34:case 39: // '"', "'"
return this.readString(code); // Operators are parsed inline in tiny state machines. '=' (61) is
// often referred to. `finishOp` simply skips the amount of
// characters it is given as second argument, and returns a token
// of the type given by its first argument.
case 47: // '/'
return this.readToken_slash();case 37:case 42: // '%*'
return this.readToken_mult_modulo(code);case 124:case 38: // '|&'
return this.readToken_pipe_amp(code);case 94: // '^'
return this.readToken_caret();case 43:case 45: // '+-'
return this.readToken_plus_min(code);case 60:case 62: // '<>'
return this.readToken_lt_gt(code);case 61:case 33: // '=!'
return this.readToken_eq_excl(code);case 126: // '~'
return this.finishOp(_tokentype.types.prefix,1);}this.raise(this.pos,"Unexpected character '"+codePointToString(code)+"'");};pp.finishOp=function(type,size){var str=this.input.slice(this.pos,this.pos+size);this.pos+=size;return this.finishToken(type,str);}; // Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.
function tryCreateRegexp(src,flags,throwErrorAt,parser){try{return new RegExp(src,flags);}catch(e){if(throwErrorAt!==undefined){if(e instanceof SyntaxError)parser.raise(throwErrorAt,"Error parsing regular expression: "+e.message);throw e;}}}var regexpUnicodeSupport=!!tryCreateRegexp("￿","u");pp.readRegexp=function(){var _this=this;var escaped=undefined,inClass=undefined,start=this.pos;for(;;){if(this.pos>=this.input.length)this.raise(start,"Unterminated regular expression");var ch=this.input.charAt(this.pos);if(_whitespace.lineBreak.test(ch))this.raise(start,"Unterminated regular expression");if(!escaped){if(ch==="[")inClass=true;else if(ch==="]"&&inClass)inClass=false;else if(ch==="/"&&!inClass)break;escaped=ch==="\\";}else escaped=false;++this.pos;}var content=this.input.slice(start,this.pos);++this.pos; // Need to use `readWord1` because '\uXXXX' sequences are allowed
// here (don't ask).
var mods=this.readWord1();var tmp=content;if(mods){var validFlags=/^[gim]*$/;if(this.options.ecmaVersion>=6)validFlags=/^[gimuy]*$/;if(!validFlags.test(mods))this.raise(start,"Invalid regular expression flag");if(mods.indexOf('u')>=0&&!regexpUnicodeSupport){ // Replace each astral symbol and every Unicode escape sequence that
// possibly represents an astral symbol or a paired surrogate with a
// single ASCII symbol to avoid throwing on regular expressions that
// are only valid in combination with the `/u` flag.
// Note: replacing with the ASCII symbol `x` might cause false
// negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
// perfectly valid pattern that is equivalent to `[a-b]`, but it would
// be replaced by `[x-b]` which throws an error.
tmp=tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g,function(_match,code,offset){code=Number("0x"+code);if(code>0x10FFFF)_this.raise(start+offset+3,"Code point out of bounds");return "x";});tmp=tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,"x");}} // Detect invalid regular expressions.
var value=null; // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
// so don't do detection if we are running under Rhino
if(!isRhino){tryCreateRegexp(tmp,undefined,start,this); // Get a regular expression object for this pattern-flag pair, or `null` in
// case the current environment doesn't support the flags it uses.
value=tryCreateRegexp(content,mods);}return this.finishToken(_tokentype.types.regexp,{pattern:content,flags:mods,value:value});}; // Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.
pp.readInt=function(radix,len){var start=this.pos,total=0;for(var i=0,e=len==null?Infinity:len;i<e;++i){var code=this.input.charCodeAt(this.pos),val=undefined;if(code>=97)val=code-97+10; // a
else if(code>=65)val=code-65+10; // A
else if(code>=48&&code<=57)val=code-48; // 0-9
else val=Infinity;if(val>=radix)break;++this.pos;total=total*radix+val;}if(this.pos===start||len!=null&&this.pos-start!==len)return null;return total;};pp.readRadixNumber=function(radix){this.pos+=2; // 0x
var val=this.readInt(radix);if(val==null)this.raise(this.start+2,"Expected number in radix "+radix);if(_identifier.isIdentifierStart(this.fullCharCodeAtPos()))this.raise(this.pos,"Identifier directly after number");return this.finishToken(_tokentype.types.num,val);}; // Read an integer, octal integer, or floating-point number.
pp.readNumber=function(startsWithDot){var start=this.pos,isFloat=false,octal=this.input.charCodeAt(this.pos)===48;if(!startsWithDot&&this.readInt(10)===null)this.raise(start,"Invalid number");var next=this.input.charCodeAt(this.pos);if(next===46){ // '.'
++this.pos;this.readInt(10);isFloat=true;next=this.input.charCodeAt(this.pos);}if(next===69||next===101){ // 'eE'
next=this.input.charCodeAt(++this.pos);if(next===43||next===45)++this.pos; // '+-'
if(this.readInt(10)===null)this.raise(start,"Invalid number");isFloat=true;}if(_identifier.isIdentifierStart(this.fullCharCodeAtPos()))this.raise(this.pos,"Identifier directly after number");var str=this.input.slice(start,this.pos),val=undefined;if(isFloat)val=parseFloat(str);else if(!octal||str.length===1)val=parseInt(str,10);else if(/[89]/.test(str)||this.strict)this.raise(start,"Invalid number");else val=parseInt(str,8);return this.finishToken(_tokentype.types.num,val);}; // Read a string value, interpreting backslash-escapes.
pp.readCodePoint=function(){var ch=this.input.charCodeAt(this.pos),code=undefined;if(ch===123){if(this.options.ecmaVersion<6)this.unexpected();var codePos=++this.pos;code=this.readHexChar(this.input.indexOf('}',this.pos)-this.pos);++this.pos;if(code>0x10FFFF)this.raise(codePos,"Code point out of bounds");}else {code=this.readHexChar(4);}return code;};function codePointToString(code){ // UTF-16 Decoding
if(code<=0xFFFF)return String.fromCharCode(code);code-=0x10000;return String.fromCharCode((code>>10)+0xD800,(code&1023)+0xDC00);}pp.readString=function(quote){var out="",chunkStart=++this.pos;for(;;){if(this.pos>=this.input.length)this.raise(this.start,"Unterminated string constant");var ch=this.input.charCodeAt(this.pos);if(ch===quote)break;if(ch===92){ // '\'
out+=this.input.slice(chunkStart,this.pos);out+=this.readEscapedChar(false);chunkStart=this.pos;}else {if(_whitespace.isNewLine(ch))this.raise(this.start,"Unterminated string constant");++this.pos;}}out+=this.input.slice(chunkStart,this.pos++);return this.finishToken(_tokentype.types.string,out);}; // Reads template string tokens.
pp.readTmplToken=function(){var out="",chunkStart=this.pos;for(;;){if(this.pos>=this.input.length)this.raise(this.start,"Unterminated template");var ch=this.input.charCodeAt(this.pos);if(ch===96||ch===36&&this.input.charCodeAt(this.pos+1)===123){ // '`', '${'
if(this.pos===this.start&&this.type===_tokentype.types.template){if(ch===36){this.pos+=2;return this.finishToken(_tokentype.types.dollarBraceL);}else {++this.pos;return this.finishToken(_tokentype.types.backQuote);}}out+=this.input.slice(chunkStart,this.pos);return this.finishToken(_tokentype.types.template,out);}if(ch===92){ // '\'
out+=this.input.slice(chunkStart,this.pos);out+=this.readEscapedChar(true);chunkStart=this.pos;}else if(_whitespace.isNewLine(ch)){out+=this.input.slice(chunkStart,this.pos);++this.pos;switch(ch){case 13:if(this.input.charCodeAt(this.pos)===10)++this.pos;case 10:out+="\n";break;default:out+=String.fromCharCode(ch);break;}if(this.options.locations){++this.curLine;this.lineStart=this.pos;}chunkStart=this.pos;}else {++this.pos;}}}; // Used to read escaped characters
pp.readEscapedChar=function(inTemplate){var ch=this.input.charCodeAt(++this.pos);++this.pos;switch(ch){case 110:return "\n"; // 'n' -> '\n'
case 114:return "\r"; // 'r' -> '\r'
case 120:return String.fromCharCode(this.readHexChar(2)); // 'x'
case 117:return codePointToString(this.readCodePoint()); // 'u'
case 116:return "\t"; // 't' -> '\t'
case 98:return "\b"; // 'b' -> '\b'
case 118:return "\u000b"; // 'v' -> '\u000b'
case 102:return "\f"; // 'f' -> '\f'
case 13:if(this.input.charCodeAt(this.pos)===10)++this.pos; // '\r\n'
case 10: // ' \n'
if(this.options.locations){this.lineStart=this.pos;++this.curLine;}return "";default:if(ch>=48&&ch<=55){var octalStr=this.input.substr(this.pos-1,3).match(/^[0-7]+/)[0];var octal=parseInt(octalStr,8);if(octal>255){octalStr=octalStr.slice(0,-1);octal=parseInt(octalStr,8);}if(octalStr!=="0"&&(this.strict||inTemplate)){this.raise(this.pos-2,"Octal literal in strict mode");}this.pos+=octalStr.length-1;return String.fromCharCode(octal);}return String.fromCharCode(ch);}}; // Used to read character escape sequences ('\x', '\u', '\U').
pp.readHexChar=function(len){var codePos=this.pos;var n=this.readInt(16,len);if(n===null)this.raise(codePos,"Bad character escape sequence");return n;}; // Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.
pp.readWord1=function(){this.containsEsc=false;var word="",first=true,chunkStart=this.pos;var astral=this.options.ecmaVersion>=6;while(this.pos<this.input.length){var ch=this.fullCharCodeAtPos();if(_identifier.isIdentifierChar(ch,astral)){this.pos+=ch<=0xffff?1:2;}else if(ch===92){ // "\"
this.containsEsc=true;word+=this.input.slice(chunkStart,this.pos);var escStart=this.pos;if(this.input.charCodeAt(++this.pos)!=117) // "u"
this.raise(this.pos,"Expecting Unicode escape sequence \\uXXXX");++this.pos;var esc=this.readCodePoint();if(!(first?_identifier.isIdentifierStart:_identifier.isIdentifierChar)(esc,astral))this.raise(escStart,"Invalid Unicode escape");word+=codePointToString(esc);chunkStart=this.pos;}else {break;}first=false;}return word+this.input.slice(chunkStart,this.pos);}; // Read an identifier or keyword token. Will check for reserved
// words when necessary.
pp.readWord=function(){var word=this.readWord1();var type=_tokentype.types.name;if((this.options.ecmaVersion>=6||!this.containsEsc)&&this.keywords.test(word))type=_tokentype.keywords[word];return this.finishToken(type,word);};},{"./identifier":2,"./locutil":5,"./state":10,"./tokentype":14,"./whitespace":16}],14:[function(_dereq_,module,exports){ // ## Token types
// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.
// All token type variables start with an underscore, to make them
// easy to recognize.
// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.
"use strict";exports.__esModule=true;function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var TokenType=function TokenType(label){var conf=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];_classCallCheck(this,TokenType);this.label=label;this.keyword=conf.keyword;this.beforeExpr=!!conf.beforeExpr;this.startsExpr=!!conf.startsExpr;this.isLoop=!!conf.isLoop;this.isAssign=!!conf.isAssign;this.prefix=!!conf.prefix;this.postfix=!!conf.postfix;this.binop=conf.binop||null;this.updateContext=null;};exports.TokenType=TokenType;function binop(name,prec){return new TokenType(name,{beforeExpr:true,binop:prec});}var beforeExpr={beforeExpr:true},startsExpr={startsExpr:true};var types={num:new TokenType("num",startsExpr),regexp:new TokenType("regexp",startsExpr),string:new TokenType("string",startsExpr),name:new TokenType("name",startsExpr),eof:new TokenType("eof"), // Punctuation token types.
bracketL:new TokenType("[",{beforeExpr:true,startsExpr:true}),bracketR:new TokenType("]"),braceL:new TokenType("{",{beforeExpr:true,startsExpr:true}),braceR:new TokenType("}"),parenL:new TokenType("(",{beforeExpr:true,startsExpr:true}),parenR:new TokenType(")"),comma:new TokenType(",",beforeExpr),semi:new TokenType(";",beforeExpr),colon:new TokenType(":",beforeExpr),dot:new TokenType("."),question:new TokenType("?",beforeExpr),arrow:new TokenType("=>",beforeExpr),template:new TokenType("template"),ellipsis:new TokenType("...",beforeExpr),backQuote:new TokenType("`",startsExpr),dollarBraceL:new TokenType("${",{beforeExpr:true,startsExpr:true}), // Operators. These carry several kinds of properties to help the
// parser use them properly (the presence of these properties is
// what categorizes them as operators).
//
// `binop`, when present, specifies that this operator is a binary
// operator, and will refer to its precedence.
//
// `prefix` and `postfix` mark the operator as a prefix or postfix
// unary operator.
//
// `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
// binary operators with a very low precedence, that should result
// in AssignmentExpression nodes.
eq:new TokenType("=",{beforeExpr:true,isAssign:true}),assign:new TokenType("_=",{beforeExpr:true,isAssign:true}),incDec:new TokenType("++/--",{prefix:true,postfix:true,startsExpr:true}),prefix:new TokenType("prefix",{beforeExpr:true,prefix:true,startsExpr:true}),logicalOR:binop("||",1),logicalAND:binop("&&",2),bitwiseOR:binop("|",3),bitwiseXOR:binop("^",4),bitwiseAND:binop("&",5),equality:binop("==/!=",6),relational:binop("</>",7),bitShift:binop("<</>>",8),plusMin:new TokenType("+/-",{beforeExpr:true,binop:9,prefix:true,startsExpr:true}),modulo:binop("%",10),star:binop("*",10),slash:binop("/",10)};exports.types=types; // Map keyword names to token types.
var keywords={};exports.keywords=keywords; // Succinct definitions of keyword token types
function kw(name){var options=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];options.keyword=name;keywords[name]=types["_"+name]=new TokenType(name,options);}kw("break");kw("case",beforeExpr);kw("catch");kw("continue");kw("debugger");kw("default",beforeExpr);kw("do",{isLoop:true,beforeExpr:true});kw("else",beforeExpr);kw("finally");kw("for",{isLoop:true});kw("function",startsExpr);kw("if");kw("return",beforeExpr);kw("switch");kw("throw",beforeExpr);kw("try");kw("var");kw("let");kw("const");kw("while",{isLoop:true});kw("with");kw("new",{beforeExpr:true,startsExpr:true});kw("this",startsExpr);kw("super",startsExpr);kw("class");kw("extends",beforeExpr);kw("export");kw("import");kw("yield",{beforeExpr:true,startsExpr:true});kw("null",startsExpr);kw("true",startsExpr);kw("false",startsExpr);kw("in",{beforeExpr:true,binop:7});kw("instanceof",{beforeExpr:true,binop:7});kw("typeof",{beforeExpr:true,prefix:true,startsExpr:true});kw("void",{beforeExpr:true,prefix:true,startsExpr:true});kw("delete",{beforeExpr:true,prefix:true,startsExpr:true});},{}],15:[function(_dereq_,module,exports){"use strict";exports.__esModule=true;exports.isArray=isArray;exports.has=has;function isArray(obj){return Object.prototype.toString.call(obj)==="[object Array]";} // Checks if an object has a property.
function has(obj,propName){return Object.prototype.hasOwnProperty.call(obj,propName);}},{}],16:[function(_dereq_,module,exports){ // Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.
"use strict";exports.__esModule=true;exports.isNewLine=isNewLine;var lineBreak=/\r\n?|\n|\u2028|\u2029/;exports.lineBreak=lineBreak;var lineBreakG=new RegExp(lineBreak.source,"g");exports.lineBreakG=lineBreakG;function isNewLine(code){return code===10||code===13||code===0x2028||code==0x2029;}var nonASCIIwhitespace=/[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;exports.nonASCIIwhitespace=nonASCIIwhitespace;},{}]},{},[3])(3);});}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],3:[function(require,module,exports){(function(global){(function(f){if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else {var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else {g=this;}(g.acorn||(g.acorn={})).walk=f();}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;}({1:[function(_dereq_,module,exports){ // AST walker module for Mozilla Parser API compatible trees
// A simple walk is one where you simply specify callbacks to be
// called on specific nodes. The last two arguments are optional. A
// simple use would be
//
//     walk.simple(myTree, {
//         Expression: function(node) { ... }
//     });
//
// to do something with all expressions. All Parser API node types
// can be used to identify node types, as well as Expression,
// Statement, and ScopeBody, which denote categories of nodes.
//
// The base argument can be used to pass a custom (recursive)
// walker, and state can be used to give this walked an initial
// state.
"use strict";exports.__esModule=true;exports.simple=simple;exports.ancestor=ancestor;exports.recursive=recursive;exports.findNodeAt=findNodeAt;exports.findNodeAround=findNodeAround;exports.findNodeAfter=findNodeAfter;exports.findNodeBefore=findNodeBefore;exports.make=make;function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function simple(node,visitors,base,state,override){if(!base)base=exports.base;(function c(node,st,override){var type=override||node.type,found=visitors[type];base[type](node,st,c);if(found)found(node,st);})(node,state,override);} // An ancestor walk builds up an array of ancestor nodes (including
// the current node) and passes them to the callback as the state parameter.
function ancestor(node,visitors,base,state){if(!base)base=exports.base;if(!state)state=[];(function c(node,st,override){var type=override||node.type,found=visitors[type];if(node!=st[st.length-1]){st=st.slice();st.push(node);}base[type](node,st,c);if(found)found(node,st);})(node,state);} // A recursive walk is one where your functions override the default
// walkers. They can modify and replace the state parameter that's
// threaded through the walk, and can opt how and whether to walk
// their child nodes (by calling their third argument on these
// nodes).
function recursive(node,state,funcs,base,override){var visitor=funcs?exports.make(funcs,base):base;(function c(node,st,override){visitor[override||node.type](node,st,c);})(node,state,override);}function makeTest(test){if(typeof test=="string")return function(type){return type==test;};else if(!test)return function(){return true;};else return test;}var Found=function Found(node,state){_classCallCheck(this,Found);this.node=node;this.state=state;} // Find a node with a given start, end, and type (all are optional,
// null can be used as wildcard). Returns a {node, state} object, or
// undefined when it doesn't find a matching node.
;function findNodeAt(node,start,end,test,base,state){test=makeTest(test);if(!base)base=exports.base;try{;(function c(node,st,override){var type=override||node.type;if((start==null||node.start<=start)&&(end==null||node.end>=end))base[type](node,st,c);if((start==null||node.start==start)&&(end==null||node.end==end)&&test(type,node))throw new Found(node,st);})(node,state);}catch(e){if(e instanceof Found)return e;throw e;}} // Find the innermost node of a given type that contains the given
// position. Interface similar to findNodeAt.
function findNodeAround(node,pos,test,base,state){test=makeTest(test);if(!base)base=exports.base;try{;(function c(node,st,override){var type=override||node.type;if(node.start>pos||node.end<pos)return;base[type](node,st,c);if(test(type,node))throw new Found(node,st);})(node,state);}catch(e){if(e instanceof Found)return e;throw e;}} // Find the outermost matching node after a given position.
function findNodeAfter(node,pos,test,base,state){test=makeTest(test);if(!base)base=exports.base;try{;(function c(node,st,override){if(node.end<pos)return;var type=override||node.type;if(node.start>=pos&&test(type,node))throw new Found(node,st);base[type](node,st,c);})(node,state);}catch(e){if(e instanceof Found)return e;throw e;}} // Find the outermost matching node before a given position.
function findNodeBefore(node,pos,test,base,state){test=makeTest(test);if(!base)base=exports.base;var max=undefined;(function c(node,st,override){if(node.start>pos)return;var type=override||node.type;if(node.end<=pos&&(!max||max.node.end<node.end)&&test(type,node))max=new Found(node,st);base[type](node,st,c);})(node,state);return max;} // Used to create a custom walker. Will fill in all missing node
// type properties with the defaults.
function make(funcs,base){if(!base)base=exports.base;var visitor={};for(var type in base){visitor[type]=base[type];}for(var type in funcs){visitor[type]=funcs[type];}return visitor;}function skipThrough(node,st,c){c(node,st);}function ignore(_node,_st,_c){} // Node walkers.
var base={};exports.base=base;base.Program=base.BlockStatement=function(node,st,c){for(var i=0;i<node.body.length;++i){c(node.body[i],st,"Statement");}};base.Statement=skipThrough;base.EmptyStatement=ignore;base.ExpressionStatement=base.ParenthesizedExpression=function(node,st,c){return c(node.expression,st,"Expression");};base.IfStatement=function(node,st,c){c(node.test,st,"Expression");c(node.consequent,st,"Statement");if(node.alternate)c(node.alternate,st,"Statement");};base.LabeledStatement=function(node,st,c){return c(node.body,st,"Statement");};base.BreakStatement=base.ContinueStatement=ignore;base.WithStatement=function(node,st,c){c(node.object,st,"Expression");c(node.body,st,"Statement");};base.SwitchStatement=function(node,st,c){c(node.discriminant,st,"Expression");for(var i=0;i<node.cases.length;++i){var cs=node.cases[i];if(cs.test)c(cs.test,st,"Expression");for(var j=0;j<cs.consequent.length;++j){c(cs.consequent[j],st,"Statement");}}};base.ReturnStatement=base.YieldExpression=function(node,st,c){if(node.argument)c(node.argument,st,"Expression");};base.ThrowStatement=base.SpreadElement=function(node,st,c){return c(node.argument,st,"Expression");};base.TryStatement=function(node,st,c){c(node.block,st,"Statement");if(node.handler){c(node.handler.param,st,"Pattern");c(node.handler.body,st,"ScopeBody");}if(node.finalizer)c(node.finalizer,st,"Statement");};base.WhileStatement=base.DoWhileStatement=function(node,st,c){c(node.test,st,"Expression");c(node.body,st,"Statement");};base.ForStatement=function(node,st,c){if(node.init)c(node.init,st,"ForInit");if(node.test)c(node.test,st,"Expression");if(node.update)c(node.update,st,"Expression");c(node.body,st,"Statement");};base.ForInStatement=base.ForOfStatement=function(node,st,c){c(node.left,st,"ForInit");c(node.right,st,"Expression");c(node.body,st,"Statement");};base.ForInit=function(node,st,c){if(node.type=="VariableDeclaration")c(node,st);else c(node,st,"Expression");};base.DebuggerStatement=ignore;base.FunctionDeclaration=function(node,st,c){return c(node,st,"Function");};base.VariableDeclaration=function(node,st,c){for(var i=0;i<node.declarations.length;++i){c(node.declarations[i],st);}};base.VariableDeclarator=function(node,st,c){c(node.id,st,"Pattern");if(node.init)c(node.init,st,"Expression");};base.Function=function(node,st,c){if(node.id)c(node.id,st,"Pattern");for(var i=0;i<node.params.length;i++){c(node.params[i],st,"Pattern");}c(node.body,st,node.expression?"ScopeExpression":"ScopeBody");}; // FIXME drop these node types in next major version
// (They are awkward, and in ES6 every block can be a scope.)
base.ScopeBody=function(node,st,c){return c(node,st,"Statement");};base.ScopeExpression=function(node,st,c){return c(node,st,"Expression");};base.Pattern=function(node,st,c){if(node.type=="Identifier")c(node,st,"VariablePattern");else if(node.type=="MemberExpression")c(node,st,"MemberPattern");else c(node,st);};base.VariablePattern=ignore;base.MemberPattern=skipThrough;base.RestElement=function(node,st,c){return c(node.argument,st,"Pattern");};base.ArrayPattern=function(node,st,c){for(var i=0;i<node.elements.length;++i){var elt=node.elements[i];if(elt)c(elt,st,"Pattern");}};base.ObjectPattern=function(node,st,c){for(var i=0;i<node.properties.length;++i){c(node.properties[i].value,st,"Pattern");}};base.Expression=skipThrough;base.ThisExpression=base.Super=base.MetaProperty=ignore;base.ArrayExpression=function(node,st,c){for(var i=0;i<node.elements.length;++i){var elt=node.elements[i];if(elt)c(elt,st,"Expression");}};base.ObjectExpression=function(node,st,c){for(var i=0;i<node.properties.length;++i){c(node.properties[i],st);}};base.FunctionExpression=base.ArrowFunctionExpression=base.FunctionDeclaration;base.SequenceExpression=base.TemplateLiteral=function(node,st,c){for(var i=0;i<node.expressions.length;++i){c(node.expressions[i],st,"Expression");}};base.UnaryExpression=base.UpdateExpression=function(node,st,c){c(node.argument,st,"Expression");};base.BinaryExpression=base.LogicalExpression=function(node,st,c){c(node.left,st,"Expression");c(node.right,st,"Expression");};base.AssignmentExpression=base.AssignmentPattern=function(node,st,c){c(node.left,st,"Pattern");c(node.right,st,"Expression");};base.ConditionalExpression=function(node,st,c){c(node.test,st,"Expression");c(node.consequent,st,"Expression");c(node.alternate,st,"Expression");};base.NewExpression=base.CallExpression=function(node,st,c){c(node.callee,st,"Expression");if(node.arguments)for(var i=0;i<node.arguments.length;++i){c(node.arguments[i],st,"Expression");}};base.MemberExpression=function(node,st,c){c(node.object,st,"Expression");if(node.computed)c(node.property,st,"Expression");};base.ExportNamedDeclaration=base.ExportDefaultDeclaration=function(node,st,c){if(node.declaration)c(node.declaration,st,node.type=="ExportNamedDeclaration"||node.declaration.id?"Statement":"Expression");if(node.source)c(node.source,st,"Expression");};base.ExportAllDeclaration=function(node,st,c){c(node.source,st,"Expression");};base.ImportDeclaration=function(node,st,c){for(var i=0;i<node.specifiers.length;i++){c(node.specifiers[i],st);}c(node.source,st,"Expression");};base.ImportSpecifier=base.ImportDefaultSpecifier=base.ImportNamespaceSpecifier=base.Identifier=base.Literal=ignore;base.TaggedTemplateExpression=function(node,st,c){c(node.tag,st,"Expression");c(node.quasi,st);};base.ClassDeclaration=base.ClassExpression=function(node,st,c){return c(node,st,"Class");};base.Class=function(node,st,c){if(node.id)c(node.id,st,"Pattern");if(node.superClass)c(node.superClass,st,"Expression");for(var i=0;i<node.body.body.length;i++){c(node.body.body[i],st);}};base.MethodDefinition=base.Property=function(node,st,c){if(node.computed)c(node.key,st,"Expression");c(node.value,st,"Expression");};base.ComprehensionExpression=function(node,st,c){for(var i=0;i<node.blocks.length;i++){c(node.blocks[i].right,st,"Expression");}c(node.body,st,"Expression");};},{}]},{},[1])(1);});}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],4:[function(require,module,exports){},{}],5:[function(require,module,exports){exports=module.exports=parse;exports.parse=parse;function parse(src,state,options){options=options||{};state=state||exports.defaultState();var start=options.start||0;var end=options.end||src.length;var index=start;while(index<end){if(state.roundDepth<0||state.curlyDepth<0||state.squareDepth<0){throw new SyntaxError('Mismatched Bracket: '+src[index-1]);}exports.parseChar(src[index++],state);}return state;}exports.parseMax=parseMax;function parseMax(src,options){options=options||{};var start=options.start||0;var index=start;var state=exports.defaultState();while(state.roundDepth>=0&&state.curlyDepth>=0&&state.squareDepth>=0){if(index>=src.length){throw new Error('The end of the string was reached with no closing bracket found.');}exports.parseChar(src[index++],state);}var end=index-1;return {start:start,end:end,src:src.substring(start,end)};}exports.parseUntil=parseUntil;function parseUntil(src,delimiter,options){options=options||{};var includeLineComment=options.includeLineComment||false;var start=options.start||0;var index=start;var state=exports.defaultState();while(state.isString()||state.regexp||state.blockComment||!includeLineComment&&state.lineComment||!startsWith(src,delimiter,index)){exports.parseChar(src[index++],state);}var end=index;return {start:start,end:end,src:src.substring(start,end)};}exports.parseChar=parseChar;function parseChar(character,state){if(character.length!==1)throw new Error('Character must be a string of length 1');state=state||exports.defaultState();state.src=state.src||'';state.src+=character;var wasComment=state.blockComment||state.lineComment;var lastChar=state.history?state.history[0]:'';if(state.regexpStart){if(character==='/'||character=='*'){state.regexp=false;}state.regexpStart=false;}if(state.lineComment){if(character==='\n'){state.lineComment=false;}}else if(state.blockComment){if(state.lastChar==='*'&&character==='/'){state.blockComment=false;}}else if(state.singleQuote){if(character==='\''&&!state.escaped){state.singleQuote=false;}else if(character==='\\'&&!state.escaped){state.escaped=true;}else {state.escaped=false;}}else if(state.doubleQuote){if(character==='"'&&!state.escaped){state.doubleQuote=false;}else if(character==='\\'&&!state.escaped){state.escaped=true;}else {state.escaped=false;}}else if(state.regexp){if(character==='/'&&!state.escaped){state.regexp=false;}else if(character==='\\'&&!state.escaped){state.escaped=true;}else {state.escaped=false;}}else if(lastChar==='/'&&character==='/'){state.history=state.history.substr(1);state.lineComment=true;}else if(lastChar==='/'&&character==='*'){state.history=state.history.substr(1);state.blockComment=true;}else if(character==='/'&&isRegexp(state.history)){state.regexp=true;state.regexpStart=true;}else if(character==='\''){state.singleQuote=true;}else if(character==='"'){state.doubleQuote=true;}else if(character==='('){state.roundDepth++;}else if(character===')'){state.roundDepth--;}else if(character==='{'){state.curlyDepth++;}else if(character==='}'){state.curlyDepth--;}else if(character==='['){state.squareDepth++;}else if(character===']'){state.squareDepth--;}if(!state.blockComment&&!state.lineComment&&!wasComment)state.history=character+state.history;state.lastChar=character; // store last character for ending block comments
return state;}exports.defaultState=function(){return new State();};function State(){this.lineComment=false;this.blockComment=false;this.singleQuote=false;this.doubleQuote=false;this.regexp=false;this.escaped=false;this.roundDepth=0;this.curlyDepth=0;this.squareDepth=0;this.history='';this.lastChar='';}State.prototype.isString=function(){return this.singleQuote||this.doubleQuote;};State.prototype.isComment=function(){return this.lineComment||this.blockComment;};State.prototype.isNesting=function(){return this.isString()||this.isComment()||this.regexp||this.roundDepth>0||this.curlyDepth>0||this.squareDepth>0;};function startsWith(str,start,i){return str.substr(i||0,start.length)===start;}exports.isPunctuator=isPunctuator;function isPunctuator(c){if(!c)return true; // the start of a string is a punctuator
var code=c.charCodeAt(0);switch(code){case 46: // . dot
case 40: // ( open bracket
case 41: // ) close bracket
case 59: // ; semicolon
case 44: // , comma
case 123: // { open curly brace
case 125: // } close curly brace
case 91: // [
case 93: // ]
case 58: // :
case 63: // ?
case 126: // ~
case 37: // %
case 38: // &
case 42: // *:
case 43: // +
case 45: // -
case 47: // /
case 60: // <
case 62: // >
case 94: // ^
case 124: // |
case 33: // !
case 61: // =
return true;default:return false;}}exports.isKeyword=isKeyword;function isKeyword(id){return id==='if'||id==='in'||id==='do'||id==='var'||id==='for'||id==='new'||id==='try'||id==='let'||id==='this'||id==='else'||id==='case'||id==='void'||id==='with'||id==='enum'||id==='while'||id==='break'||id==='catch'||id==='throw'||id==='const'||id==='yield'||id==='class'||id==='super'||id==='return'||id==='typeof'||id==='delete'||id==='switch'||id==='export'||id==='import'||id==='default'||id==='finally'||id==='extends'||id==='function'||id==='continue'||id==='debugger'||id==='package'||id==='private'||id==='interface'||id==='instanceof'||id==='implements'||id==='protected'||id==='public'||id==='static'||id==='yield'||id==='let';}function isRegexp(history){ //could be start of regexp or divide sign
history=history.replace(/^\s*/,''); //unless its an `if`, `while`, `for` or `with` it's a divide, so we assume it's a divide
if(history[0]===')')return false; //unless it's a function expression, it's a regexp, so we assume it's a regexp
if(history[0]==='}')return true; //any punctuation means it's a regexp
if(isPunctuator(history[0]))return true; //if the last thing was a keyword then it must be a regexp (e.g. `typeof /foo/`)
if(/^\w+\b/.test(history)&&isKeyword(/^\w+\b/.exec(history)[0].split('').reverse().join('')))return true;return false;}},{}],6:[function(require,module,exports){'use strict';var acorn=require('acorn');var walk=require('acorn/dist/walk');var lastSRC='(null)';var lastRes=true;var lastConstants=undefined;var STATEMENT_WHITE_LIST={'EmptyStatement':true,'ExpressionStatement':true};var EXPRESSION_WHITE_LIST={'ParenthesizedExpression':true,'ArrayExpression':true,'ObjectExpression':true,'SequenceExpression':true,'TemplateLiteral':true,'UnaryExpression':true,'BinaryExpression':true,'LogicalExpression':true,'ConditionalExpression':true,'Identifier':true,'Literal':true,'ComprehensionExpression':true,'TaggedTemplateExpression':true,'MemberExpression':true,'CallExpression':true,'NewExpression':true};module.exports=isConstant;function isConstant(src,constants){src='('+src+')';if(lastSRC===src&&lastConstants===constants)return lastRes;lastSRC=src;lastConstants=constants;if(!isExpression(src))return lastRes=false;var ast;try{ast=acorn.parse(src,{ecmaVersion:6,allowReturnOutsideFunction:true,allowImportExportEverywhere:true,allowHashBang:true});}catch(ex){return lastRes=false;}var isConstant=true;walk.simple(ast,{Statement:function Statement(node){if(isConstant){if(STATEMENT_WHITE_LIST[node.type]!==true){isConstant=false;}}},Expression:function Expression(node){if(isConstant){if(EXPRESSION_WHITE_LIST[node.type]!==true){isConstant=false;}}},MemberExpression:function MemberExpression(node){if(isConstant){if(node.computed)isConstant=false;else if(node.property.name[0]==='_')isConstant=false;}},Identifier:function Identifier(node){if(isConstant){if(!constants||!(node.name in constants)){isConstant=false;}}}});return lastRes=isConstant;}isConstant.isConstant=isConstant;isConstant.toConstant=toConstant;function toConstant(src,constants){if(!isConstant(src,constants))throw new Error(JSON.stringify(src)+' is not constant.');return Function(Object.keys(constants||{}).join(','),'return ('+src+')').apply(null,Object.keys(constants||{}).map(function(key){return constants[key];}));}function isExpression(src){try{eval('throw "STOP"; (function () { return ('+src+'); })()');return false;}catch(err){return err==='STOP';}}},{"acorn":2,"acorn/dist/walk":3}],7:[function(require,module,exports){'use strict';var ContextMenu=function(_View){_inherits(ContextMenu,_View);function ContextMenu(params){_classCallCheck2(this,ContextMenu); // Recycle other context menus
var _this2=_possibleConstructorReturn(this,Object.getPrototypeOf(ContextMenu).call(this,params));if($('.context-menu').length>0){_this2.$element=$('.context-menu');}else {_this2.$element=_.ul({class:'context-menu dropdown-menu',role:'menu'});}_this2.$element.css({position:'absolute','z-index':1200,top:_this2.pos.y,left:_this2.pos.x,display:'block'});_this2.fetch();return _this2;}_createClass(ContextMenu,[{key:"render",value:function render(){var view=this;view.$element.html(_.each(view.model,function(label,func){if(func=='---'){return _.li({class:'dropdown-header'},label);}else {return _.li({class:typeof func==='function'?'':'disabled'},_.a({tabindex:'-1',href:'#'},label).click(function(e){e.preventDefault();e.stopPropagation();if(func){func(e);view.remove();}}));}}));$('body').append(view.$element);}}]);return ContextMenu;}(View); // jQuery extention
jQuery.fn.extend({context:function context(menuItems){return this.each(function(){$(this).on('contextmenu',function(e){if(e.ctrlKey){return;}$('.context-menu-target-element').removeClass('context-menu-target-element');e.preventDefault();e.stopPropagation();if(e.which==3){$(this).toggleClass('context-menu-target-element',true);var menu=new ContextMenu({model:menuItems,pos:{x:e.pageX,y:e.pageY}});}});});}}); // Event handling
$('body').click(function(e){if($(e.target).parents('.context-menu').length<1){$('.context-menu-target-element').removeClass('context-menu-target-element');ViewHelper.removeAll('ContextMenu');}});},{}],8:[function(require,module,exports){'use strict';var pathToRegexp=require('path-to-regexp');var routes=[];var Router=function(){function Router(){_classCallCheck2(this,Router);}_createClass(Router,null,[{key:"route",value:function route(path,controller){routes[path]={controller:controller};}},{key:"go",value:function go(url){location.hash=url;}},{key:"goToBaseDir",value:function goToBaseDir(){var url=this.url||'/';var base=new String(url).substring(0,url.lastIndexOf('/'));this.go(base);}},{key:"init",value:function init(){ // Get the url
var url=location.hash.slice(1)||'/';var trimmed=url.substring(0,url.indexOf('?'));if(trimmed){url=trimmed;} // Look for route
var context={};var route=void 0; // Exact match
if(routes[url]){route=routes[url]; // Use path to regexp
}else {for(var path in routes){var keys=[];var re=pathToRegexp(path,keys);var values=re.exec(url); // A match was found
if(re.test(url)){ // Set the route
route=routes[path]; // Add context variables (first result (0) is the entire path,
// so assign that manually and start the counter at 1 instead)
route.url=url;var counter=1;var _iteratorNormalCompletion=true;var _didIteratorError=false;var _iteratorError=undefined;try{for(var _iterator=keys[Symbol.iterator](),_step;!(_iteratorNormalCompletion=(_step=_iterator.next()).done);_iteratorNormalCompletion=true){var key=_step.value;route[key.name]=values[counter];counter++;}}catch(err){_didIteratorError=true;_iteratorError=err;}finally {try{if(!_iteratorNormalCompletion&&_iterator.return){_iterator.return();}}finally {if(_didIteratorError){throw _iteratorError;}}}break;}}}if(route){route.controller();}}}]);return Router;}();window.addEventListener('hashchange',Router.init);window.Router=Router;},{"path-to-regexp":43}],9:[function(require,module,exports){var Templating={};function append(el,content){if(Object.prototype.toString.call(content)==='[object Array]'){for(var i in content){append(el,content[i]);}}else if(content){el.append(content);}}function create(tag,attr,content){var el=$('<'+tag+'></'+tag+'>'); // If the attribute parameter fails, it's probably an element or a string
try{for(var k in attr){el.attr(k,attr[k]);}}catch(err){content=attr;}append(el,content);return el;}function declareMethod(type){Templating[type]=function(attr,content){return create(type,attr,content);};}function declareBootstrapMethod(type){var tagName='div';if(type.indexOf('|')>-1){tagName=type.split('|')[1];type=type.split('|')[0];}var functionName=type.replace(/-/g,'_');Templating[functionName]=function(attr,content){return create(tagName,attr,content).addClass(type);};}var elementTypes=[ // Block elements
'div','section','nav','hr','label','textarea','audio','video','canvas','iframe', // Inline elements
'img', // Table elements
'table','thead','tbody','th','td','tr', // Select
'select','option','input', // Headings
'h1','h2','h3','h4','h5','h6', // Body text
'span','p','strong','b', // Action buttons
'a','button', // List
'ol','ul','li', // Forms
'form','input'];var bootstrapTypes=['row','col','col-xs-1','col-xs-2','col-xs-3','col-xs-4','col-xs-5','col-xs-6','col-xs-7','col-xs-8','col-xs-9','col-xs-10','col-xs-11','col-xs-12','col-sm-1','col-sm-2','col-sm-3','col-sm-4','col-sm-5','col-sm-6','col-sm-7','col-sm-8','col-sm-9','col-sm-10','col-sm-11','col-sm-12','col-md-1','col-md-2','col-md-3','col-md-4','col-md-5','col-md-6','col-md-7','col-md-8','col-md-9','col-md-10','col-md-11','col-md-12','col-lg-1','col-lg-2','col-lg-3','col-lg-4','col-lg-5','col-lg-6','col-lg-7','col-lg-8','col-lg-9','col-lg-10','col-lg-11','col-lg-12','jumbotron','container','panel','panel-heading','panel-footer','panel-collapse','panel-body','navbar|nav','navbar-nav|ul','collapse','glyphicon|span','btn|button','btn-group','list-group','list-group-item','input-group','input-group-btn|span','input-group-addon|span','form-control|input'];for(var i in elementTypes){declareMethod(elementTypes[i]);}for(var i in bootstrapTypes){declareBootstrapMethod(bootstrapTypes[i]);}Templating.if=function(condition,content){return condition?content:null;};Templating.each=function(array,callback){var elements=[];for(var i in array){var element=callback(i,array[i]);if(element){elements.push(element);}}return elements;};window._=Templating;},{}],10:[function(require,module,exports){'use strict'; /**
 *  jQuery extension
 */(function($){$.event.special.destroyed={remove:function remove(o){if(o.handler){o.handler();}}};})(jQuery); /**
 * GUID
 */function guid(){function s4(){return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);}return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();} /**
 * Helper
 */var instances=[];var ViewHelper=function(){function ViewHelper(){_classCallCheck2(this,ViewHelper);}_createClass(ViewHelper,null,[{key:"getAll",value:function getAll(type){var results=[];if(type){for(var i in instances){var instance=instances[i];var name=instance.name;if(name==type){results.push(instance);}}}else {results=instances;}return results;}},{key:"get",value:function get(type){var results=ViewHelper.getAll(type);var view=results.length>0?results[0]:null;return view;}},{key:"clear",value:function clear(type){for(var _guid in instances){var instance=instances[_guid];var name=instance.constructor.name;if(!type||name==type){instance.remove();}}}},{key:"removeAll",value:function removeAll(type){var _iteratorNormalCompletion2=true;var _didIteratorError2=false;var _iteratorError2=undefined;try{for(var _iterator2=ViewHelper.getAll(type)[Symbol.iterator](),_step2;!(_iteratorNormalCompletion2=(_step2=_iterator2.next()).done);_iteratorNormalCompletion2=true){var view=_step2.value;view.remove();}}catch(err){_didIteratorError2=true;_iteratorError2=err;}finally {try{if(!_iteratorNormalCompletion2&&_iterator2.return){_iterator2.return();}}finally {if(_didIteratorError2){throw _iteratorError2;}}}}}]);return ViewHelper;}();window.ViewHelper=ViewHelper; /**
 * Class
 */var View=function(){ /**
     * Init
     */function View(args){_classCallCheck2(this,View);this.name=this.constructor.name;this.guid=guid();this.events={};this.adopt(args);instances[this.guid]=this;}_createClass(View,[{key:"getName",value:function getName(){var name=this.constructor.toString();name=name.substring('function '.length);name=name.substring(0,name.indexOf('('));return name;}},{key:"init",value:function init(){this.prerender();this.render();this.postrender();if(this.$element){this.element=this.$element[0];this.$element.data('view',this);this.$element.bind('destroyed',function(){var view=$(this).data('view');if(view){$(this).data('view').remove();}});}this.trigger('ready',this);this.isReady=true;}},{key:"ready",value:function ready(callback){if(this.isReady){callback(this);}else {this.on('ready',callback);}} // Adopt values
},{key:"adopt",value:function adopt(args){for(var k in args){this[k]=args[k];}return this;} /**
     * Rendering
     */},{key:"prerender",value:function prerender(){}},{key:"render",value:function render(){}},{key:"postrender",value:function postrender(){} /**
     * Events
     */ // Removes the view from DOM and memory
},{key:"remove",value:function remove(timeout){var view=this;if(!view.destroyed){view.destroyed=true;setTimeout(function(){view.trigger('remove');if(view.$element&&view.$element.length>0){view.$element.remove();}instances.splice(view.guid,1);},timeout||0);}} // Call an event (for internal use)
},{key:"call",value:function call(callback,data,ui){callback(data,ui,this);} // Trigger an event
},{key:"trigger",value:function trigger(e,obj){if(this.events[e]){if(typeof this.events[e]==='function'){this.events[e](obj);}else {for(var i in this.events[e]){if(this.events[e][i]){this.events[e][i](obj);}}}}} // Bind an event
},{key:"on",value:function on(e,callback){var view=this; // No events registered, register this as the only event
if(!this.events[e]){this.events[e]=function(data){view.call(callback,data,this);}; // Events have already been registered, add to callback array
}else { // Only one event is registered, so convert from a single reference to an array
if(!this.events[e].length){this.events[e]=[this.events[e]];} // Insert the event call into the array 
this.events[e].push(function(data){view.call(callback,data,this);});}} // Check if event exists
},{key:"hasEvent",value:function hasEvent(name){for(var k in this.events){if(k==name){return true;}}return false;} /**
     * Fetch
     */},{key:"fetch",value:function fetch(){var view=this;function getModel(){ // Get model from URL
if(!view.model&&typeof view.modelUrl==='string'){$.getJSON(view.modelUrl,function(data){view.model=data;view.init();}); // Get model with function
}else if(!view.model&&typeof view.modelFunction==='function'){view.modelFunction(function(data){view.model=data;view.init();}); // Just perform the initialisation
}else {view.init();}} // Get rendered content from URL
if(typeof view.renderUrl==='string'){$.get(view.renderUrl,function(html){if(view.$element){view.$element.append(html);}else {view.$element=$(html);} // And then get the model
getModel();}); // If no render url is defined, just get the model
}else {getModel();}}}]);return View;}();window.View=View;},{}],11:[function(require,module,exports){require('./Router');require('./Templating');require('./View');require('./ContextMenu');},{"./ContextMenu":7,"./Router":8,"./Templating":9,"./View":10}],12:[function(require,module,exports){module.exports=Array.isArray||function(arr){return Object.prototype.toString.call(arr)=='[object Array]';};},{}],13:[function(require,module,exports){'use strict';var nodes=require('./nodes');var filters=require('./filters');var doctypes=require('./doctypes');var runtime=require('./runtime');var utils=require('./utils');var selfClosing=require('void-elements');var parseJSExpression=require('character-parser').parseMax;var constantinople=require('constantinople');function isConstant(src){return constantinople(src,{jade:runtime,'jade_interp':undefined});}function toConstant(src){return constantinople.toConstant(src,{jade:runtime,'jade_interp':undefined});}function errorAtNode(node,error){error.line=node.line;error.filename=node.filename;return error;} /**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @param {Object} options
 * @api public
 */var Compiler=module.exports=function Compiler(node,options){this.options=options=options||{};this.node=node;this.hasCompiledDoctype=false;this.hasCompiledTag=false;this.pp=options.pretty||false;if(this.pp&&typeof this.pp!=='string'){this.pp='  ';}this.debug=false!==options.compileDebug;this.indents=0;this.parentIndents=0;this.terse=false;this.mixins={};this.dynamicMixins=false;if(options.doctype)this.setDoctype(options.doctype);}; /**
 * Compiler prototype.
 */Compiler.prototype={ /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */compile:function compile(){this.buf=[];if(this.pp)this.buf.push("var jade_indent = [];");this.lastBufferedIdx=-1;this.visit(this.node);if(!this.dynamicMixins){ // if there are no dynamic mixins we can remove any un-used mixins
var mixinNames=Object.keys(this.mixins);for(var i=0;i<mixinNames.length;i++){var mixin=this.mixins[mixinNames[i]];if(!mixin.used){for(var x=0;x<mixin.instances.length;x++){for(var y=mixin.instances[x].start;y<mixin.instances[x].end;y++){this.buf[y]='';}}}}}return this.buf.join('\n');}, /**
   * Sets the default doctype `name`. Sets terse mode to `true` when
   * html 5 is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {string} name
   * @api public
   */setDoctype:function setDoctype(name){this.doctype=doctypes[name.toLowerCase()]||'<!DOCTYPE '+name+'>';this.terse=this.doctype.toLowerCase()=='<!doctype html>';this.xml=0==this.doctype.indexOf('<?xml');}, /**
   * Buffer the given `str` exactly as is or with interpolation
   *
   * @param {String} str
   * @param {Boolean} interpolate
   * @api public
   */buffer:function buffer(str,interpolate){var self=this;if(interpolate){var match=/(\\)?([#!]){((?:.|\n)*)$/.exec(str);if(match){this.buffer(str.substr(0,match.index),false);if(match[1]){ // escape
this.buffer(match[2]+'{',false);this.buffer(match[3],true);return;}else {var rest=match[3];var range=parseJSExpression(rest);var code=('!'==match[2]?'':'jade.escape')+"((jade_interp = "+range.src+") == null ? '' : jade_interp)";this.bufferExpression(code);this.buffer(rest.substr(range.end+1),true);return;}}}str=utils.stringify(str);str=str.substr(1,str.length-2);if(this.lastBufferedIdx==this.buf.length){if(this.lastBufferedType==='code')this.lastBuffered+=' + "';this.lastBufferedType='text';this.lastBuffered+=str;this.buf[this.lastBufferedIdx-1]='buf.push('+this.bufferStartChar+this.lastBuffered+'");';}else {this.buf.push('buf.push("'+str+'");');this.lastBufferedType='text';this.bufferStartChar='"';this.lastBuffered=str;this.lastBufferedIdx=this.buf.length;}}, /**
   * Buffer the given `src` so it is evaluated at run time
   *
   * @param {String} src
   * @api public
   */bufferExpression:function bufferExpression(src){if(isConstant(src)){return this.buffer(toConstant(src)+'',false);}if(this.lastBufferedIdx==this.buf.length){if(this.lastBufferedType==='text')this.lastBuffered+='"';this.lastBufferedType='code';this.lastBuffered+=' + ('+src+')';this.buf[this.lastBufferedIdx-1]='buf.push('+this.bufferStartChar+this.lastBuffered+');';}else {this.buf.push('buf.push('+src+');');this.lastBufferedType='code';this.bufferStartChar='';this.lastBuffered='('+src+')';this.lastBufferedIdx=this.buf.length;}}, /**
   * Buffer an indent based on the current `indent`
   * property and an additional `offset`.
   *
   * @param {Number} offset
   * @param {Boolean} newline
   * @api public
   */prettyIndent:function prettyIndent(offset,newline){offset=offset||0;newline=newline?'\n':'';this.buffer(newline+Array(this.indents+offset).join(this.pp));if(this.parentIndents)this.buf.push("buf.push.apply(buf, jade_indent);");}, /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */visit:function visit(node){var debug=this.debug;if(debug){this.buf.push('jade_debug.unshift(new jade.DebugItem( '+node.line+', '+(node.filename?utils.stringify(node.filename):'jade_debug[0].filename')+' ));');} // Massive hack to fix our context
// stack for - else[ if] etc
if(false===node.debug&&this.debug){this.buf.pop();this.buf.pop();}this.visitNode(node);if(debug)this.buf.push('jade_debug.shift();');}, /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */visitNode:function visitNode(node){return this['visit'+node.type](node);}, /**
   * Visit case `node`.
   *
   * @param {Literal} node
   * @api public
   */visitCase:function visitCase(node){var _=this.withinCase;this.withinCase=true;this.buf.push('switch ('+node.expr+'){');this.visit(node.block);this.buf.push('}');this.withinCase=_;}, /**
   * Visit when `node`.
   *
   * @param {Literal} node
   * @api public
   */visitWhen:function visitWhen(node){if('default'==node.expr){this.buf.push('default:');}else {this.buf.push('case '+node.expr+':');}if(node.block){this.visit(node.block);this.buf.push('  break;');}}, /**
   * Visit literal `node`.
   *
   * @param {Literal} node
   * @api public
   */visitLiteral:function visitLiteral(node){this.buffer(node.str);}, /**
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */visitBlock:function visitBlock(block){var len=block.nodes.length,escape=this.escape,pp=this.pp; // Pretty print multi-line text
if(pp&&len>1&&!escape&&block.nodes[0].isText&&block.nodes[1].isText)this.prettyIndent(1,true);for(var i=0;i<len;++i){ // Pretty print text
if(pp&&i>0&&!escape&&block.nodes[i].isText&&block.nodes[i-1].isText)this.prettyIndent(1,false);this.visit(block.nodes[i]); // Multiple text nodes are separated by newlines
if(block.nodes[i+1]&&block.nodes[i].isText&&block.nodes[i+1].isText)this.buffer('\n');}}, /**
   * Visit a mixin's `block` keyword.
   *
   * @param {MixinBlock} block
   * @api public
   */visitMixinBlock:function visitMixinBlock(block){if(this.pp)this.buf.push("jade_indent.push('"+Array(this.indents+1).join(this.pp)+"');");this.buf.push('block && block();');if(this.pp)this.buf.push("jade_indent.pop();");}, /**
   * Visit `doctype`. Sets terse mode to `true` when html 5
   * is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {Doctype} doctype
   * @api public
   */visitDoctype:function visitDoctype(doctype){if(doctype&&(doctype.val||!this.doctype)){this.setDoctype(doctype.val||'default');}if(this.doctype)this.buffer(this.doctype);this.hasCompiledDoctype=true;}, /**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */visitMixin:function visitMixin(mixin){var name='jade_mixins[';var args=mixin.args||'';var block=mixin.block;var attrs=mixin.attrs;var attrsBlocks=mixin.attributeBlocks.slice();var pp=this.pp;var dynamic=mixin.name[0]==='#';var key=mixin.name;if(dynamic)this.dynamicMixins=true;name+=(dynamic?mixin.name.substr(2,mixin.name.length-3):'"'+mixin.name+'"')+']';this.mixins[key]=this.mixins[key]||{used:false,instances:[]};if(mixin.call){this.mixins[key].used=true;if(pp)this.buf.push("jade_indent.push('"+Array(this.indents+1).join(pp)+"');");if(block||attrs.length||attrsBlocks.length){this.buf.push(name+'.call({');if(block){this.buf.push('block: function(){'); // Render block with no indents, dynamically added when rendered
this.parentIndents++;var _indents=this.indents;this.indents=0;this.visit(mixin.block);this.indents=_indents;this.parentIndents--;if(attrs.length||attrsBlocks.length){this.buf.push('},');}else {this.buf.push('}');}}if(attrsBlocks.length){if(attrs.length){var val=this.attrs(attrs);attrsBlocks.unshift(val);}this.buf.push('attributes: jade.merge(['+attrsBlocks.join(',')+'])');}else if(attrs.length){var val=this.attrs(attrs);this.buf.push('attributes: '+val);}if(args){this.buf.push('}, '+args+');');}else {this.buf.push('});');}}else {this.buf.push(name+'('+args+');');}if(pp)this.buf.push("jade_indent.pop();");}else {var mixin_start=this.buf.length;args=args?args.split(','):[];var rest;if(args.length&&/^\.\.\./.test(args[args.length-1].trim())){rest=args.pop().trim().replace(/^\.\.\./,'');} // we need use jade_interp here for v8: https://code.google.com/p/v8/issues/detail?id=4165
// once fixed, use this: this.buf.push(name + ' = function(' + args.join(',') + '){');
this.buf.push(name+' = jade_interp = function('+args.join(',')+'){');this.buf.push('var block = (this && this.block), attributes = (this && this.attributes) || {};');if(rest){this.buf.push('var '+rest+' = [];');this.buf.push('for (jade_interp = '+args.length+'; jade_interp < arguments.length; jade_interp++) {');this.buf.push('  '+rest+'.push(arguments[jade_interp]);');this.buf.push('}');}this.parentIndents++;this.visit(block);this.parentIndents--;this.buf.push('};');var mixin_end=this.buf.length;this.mixins[key].instances.push({start:mixin_start,end:mixin_end});}}, /**
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @api public
   */visitTag:function visitTag(tag){this.indents++;var name=tag.name,pp=this.pp,self=this;function bufferName(){if(tag.buffer)self.bufferExpression(name);else self.buffer(name);}if('pre'==tag.name)this.escape=true;if(!this.hasCompiledTag){if(!this.hasCompiledDoctype&&'html'==name){this.visitDoctype();}this.hasCompiledTag=true;} // pretty print
if(pp&&!tag.isInline())this.prettyIndent(0,true);if(tag.selfClosing||!this.xml&&selfClosing[tag.name]){this.buffer('<');bufferName();this.visitAttributes(tag.attrs,tag.attributeBlocks.slice());this.terse?this.buffer('>'):this.buffer('/>'); // if it is non-empty throw an error
if(tag.block&&!(tag.block.type==='Block'&&tag.block.nodes.length===0)&&tag.block.nodes.some(function(tag){return tag.type!=='Text'||!/^\s*$/.test(tag.val);})){throw errorAtNode(tag,new Error(name+' is self closing and should not have content.'));}}else { // Optimize attributes buffering
this.buffer('<');bufferName();this.visitAttributes(tag.attrs,tag.attributeBlocks.slice());this.buffer('>');if(tag.code)this.visitCode(tag.code);this.visit(tag.block); // pretty print
if(pp&&!tag.isInline()&&'pre'!=tag.name&&!tag.canInline())this.prettyIndent(0,true);this.buffer('</');bufferName();this.buffer('>');}if('pre'==tag.name)this.escape=false;this.indents--;}, /**
   * Visit `filter`, throwing when the filter does not exist.
   *
   * @param {Filter} filter
   * @api public
   */visitFilter:function visitFilter(filter){var text=filter.block.nodes.map(function(node){return node.val;}).join('\n');filter.attrs.filename=this.options.filename;try{this.buffer(filters(filter.name,text,filter.attrs),true);}catch(err){throw errorAtNode(filter,err);}}, /**
   * Visit `text` node.
   *
   * @param {Text} text
   * @api public
   */visitText:function visitText(text){this.buffer(text.val,true);}, /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */visitComment:function visitComment(comment){if(!comment.buffer)return;if(this.pp)this.prettyIndent(1,true);this.buffer('<!--'+comment.val+'-->');}, /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */visitBlockComment:function visitBlockComment(comment){if(!comment.buffer)return;if(this.pp)this.prettyIndent(1,true);this.buffer('<!--'+comment.val);this.visit(comment.block);if(this.pp)this.prettyIndent(1,true);this.buffer('-->');}, /**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */visitCode:function visitCode(code){ // Wrap code blocks with {}.
// we only wrap unbuffered code blocks ATM
// since they are usually flow control
// Buffer code
if(code.buffer){var val=code.val.trim();val='null == (jade_interp = '+val+') ? "" : jade_interp';if(code.escape)val='jade.escape('+val+')';this.bufferExpression(val);}else {this.buf.push(code.val);} // Block support
if(code.block){if(!code.buffer)this.buf.push('{');this.visit(code.block);if(!code.buffer)this.buf.push('}');}}, /**
   * Visit `each` block.
   *
   * @param {Each} each
   * @api public
   */visitEach:function visitEach(each){this.buf.push(''+'// iterate '+each.obj+'\n'+';(function(){\n'+'  var $$obj = '+each.obj+';\n'+'  if (\'number\' == typeof $$obj.length) {\n');if(each.alternative){this.buf.push('  if ($$obj.length) {');}this.buf.push(''+'    for (var '+each.key+' = 0, $$l = $$obj.length; '+each.key+' < $$l; '+each.key+'++) {\n'+'      var '+each.val+' = $$obj['+each.key+'];\n');this.visit(each.block);this.buf.push('    }\n');if(each.alternative){this.buf.push('  } else {');this.visit(each.alternative);this.buf.push('  }');}this.buf.push(''+'  } else {\n'+'    var $$l = 0;\n'+'    for (var '+each.key+' in $$obj) {\n'+'      $$l++;'+'      var '+each.val+' = $$obj['+each.key+'];\n');this.visit(each.block);this.buf.push('    }\n');if(each.alternative){this.buf.push('    if ($$l === 0) {');this.visit(each.alternative);this.buf.push('    }');}this.buf.push('  }\n}).call(this);\n');}, /**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */visitAttributes:function visitAttributes(attrs,attributeBlocks){if(attributeBlocks.length){if(attrs.length){var val=this.attrs(attrs);attributeBlocks.unshift(val);}this.bufferExpression('jade.attrs(jade.merge(['+attributeBlocks.join(',')+']), '+utils.stringify(this.terse)+')');}else if(attrs.length){this.attrs(attrs,true);}}, /**
   * Compile attributes.
   */attrs:function attrs(_attrs,buffer){var buf=[];var classes=[];var classEscaping=[];_attrs.forEach(function(attr){var key=attr.name;var escaped=attr.escaped;if(key==='class'){classes.push(attr.val);classEscaping.push(attr.escaped);}else if(isConstant(attr.val)){if(buffer){this.buffer(runtime.attr(key,toConstant(attr.val),escaped,this.terse));}else {var val=toConstant(attr.val);if(key==='style')val=runtime.style(val);if(escaped&&!(key.indexOf('data')===0&&typeof val!=='string')){val=runtime.escape(val);}buf.push(utils.stringify(key)+': '+utils.stringify(val));}}else {if(buffer){this.bufferExpression('jade.attr("'+key+'", '+attr.val+', '+utils.stringify(escaped)+', '+utils.stringify(this.terse)+')');}else {var val=attr.val;if(key==='style'){val='jade.style('+val+')';}if(escaped&&!(key.indexOf('data')===0)){val='jade.escape('+val+')';}else if(escaped){val='(typeof (jade_interp = '+val+') == "string" ? jade.escape(jade_interp) : jade_interp)';}buf.push(utils.stringify(key)+': '+val);}}}.bind(this));if(buffer){if(classes.every(isConstant)){this.buffer(runtime.cls(classes.map(toConstant),classEscaping));}else {this.bufferExpression('jade.cls(['+classes.join(',')+'], '+utils.stringify(classEscaping)+')');}}else if(classes.length){if(classes.every(isConstant)){classes=utils.stringify(runtime.joinClasses(classes.map(toConstant).map(runtime.joinClasses).map(function(cls,i){return classEscaping[i]?runtime.escape(cls):cls;})));}else {classes='(jade_interp = '+utils.stringify(classEscaping)+','+' jade.joinClasses(['+classes.join(',')+'].map(jade.joinClasses).map(function (cls, i) {'+'   return jade_interp[i] ? jade.escape(cls) : cls'+' }))'+')';}if(classes.length)buf.push('"class": '+classes);}return '{'+buf.join(',')+'}';}};},{"./doctypes":14,"./filters":15,"./nodes":28,"./runtime":36,"./utils":37,"character-parser":5,"constantinople":6,"void-elements":45}],14:[function(require,module,exports){'use strict';module.exports={'default':'<!DOCTYPE html>','xml':'<?xml version="1.0" encoding="utf-8" ?>','transitional':'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">','strict':'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">','frameset':'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">','1.1':'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">','basic':'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">','mobile':'<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'};},{}],15:[function(require,module,exports){'use strict';module.exports=filter;function filter(name,str,options){if(typeof filter[name]==='function'){return filter[name](str,options);}else {throw new Error('unknown filter ":'+name+'"');}}},{}],16:[function(require,module,exports){(function(process){'use strict'; /*!
 * Jade
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */ /**
 * Module dependencies.
 */var Parser=require('./parser'),Lexer=require('./lexer'),Compiler=require('./compiler'),runtime=require('./runtime'),addWith=require('with'),fs=require('fs'),utils=require('./utils'); /**
 * Expose self closing tags.
 */ // FIXME: either stop exporting selfClosing in v2 or export the new object
// form
exports.selfClosing=Object.keys(require('void-elements')); /**
 * Default supported doctypes.
 */exports.doctypes=require('./doctypes'); /**
 * Text filters.
 */exports.filters=require('./filters'); /**
 * Utilities.
 */exports.utils=utils; /**
 * Expose `Compiler`.
 */exports.Compiler=Compiler; /**
 * Expose `Parser`.
 */exports.Parser=Parser; /**
 * Expose `Lexer`.
 */exports.Lexer=Lexer; /**
 * Nodes.
 */exports.nodes=require('./nodes'); /**
 * Jade runtime helpers.
 */exports.runtime=runtime; /**
 * Template function cache.
 */exports.cache={}; /**
 * Parse the given `str` of jade and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api private
 */function parse(str,options){if(options.lexer){console.warn('Using `lexer` as a local in render() is deprecated and '+'will be interpreted as an option in Jade 2.0.0');} // Parse
var parser=new (options.parser||Parser)(str,options.filename,options);var tokens;try{ // Parse
tokens=parser.parse();}catch(err){parser=parser.context();runtime.rethrow(err,parser.filename,parser.lexer.lineno,parser.input);} // Compile
var compiler=new (options.compiler||Compiler)(tokens,options);var js;try{js=compiler.compile();}catch(err){if(err.line&&(err.filename||!options.filename)){runtime.rethrow(err,err.filename,err.line,parser.input);}else {if(err instanceof Error){err.message+='\n\nPlease report this entire error and stack trace to https://github.com/jadejs/jade/issues';}throw err;}} // Debug compiler
if(options.debug){console.error("\nCompiled Function:\n\n\u001b[90m%s\u001b[0m",js.replace(/^/gm,'  '));}var globals=[];if(options.globals){globals=options.globals.slice();}globals.push('jade');globals.push('jade_mixins');globals.push('jade_interp');globals.push('jade_debug');globals.push('buf');var body=''+'var buf = [];\n'+'var jade_mixins = {};\n'+'var jade_interp;\n'+(options.self?'var self = locals || {};\n'+js:addWith('locals || {}','\n'+js,globals))+';'+'return buf.join("");';return {body:body,dependencies:parser.dependencies};} /**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `str` is not set, the file specified in `options.filename` will be read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @param {Object} options
 * @param {String=} str
 * @return {Function}
 * @api private
 */function handleTemplateCache(options,str){var key=options.filename;if(options.cache&&exports.cache[key]){return exports.cache[key];}else {if(str===undefined)str=fs.readFileSync(options.filename,'utf8');var templ=exports.compile(str,options);if(options.cache)exports.cache[key]=templ;return templ;}} /**
 * Compile a `Function` representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false` and to resolve imports/extends
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */exports.compile=function(str,options){var options=options||{},filename=options.filename?utils.stringify(options.filename):'undefined',fn;str=String(str);var parsed=parse(str,options);if(options.compileDebug!==false){fn=['var jade_debug = [ new jade.DebugItem( 1, '+filename+' ) ];','try {',parsed.body,'} catch (err) {','  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno'+(options.compileDebug===true?','+utils.stringify(str):'')+');','}'].join('\n');}else {fn=parsed.body;}fn=new Function('locals, jade',fn);var res=function res(locals){return fn(locals,Object.create(runtime));};if(options.client){res.toString=function(){var err=new Error('The `client` option is deprecated, use the `jade.compileClient` method instead');err.name='Warning';console.error(err.stack|| /* istanbul ignore next */err.message);return exports.compileClient(str,options);};}res.dependencies=parsed.dependencies;return res;}; /**
 * Compile a JavaScript source representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *
 * @param {String} str
 * @param {Options} options
 * @return {Object}
 * @api public
 */exports.compileClientWithDependenciesTracked=function(str,options){var options=options||{};var name=options.name||'template';var filename=options.filename?utils.stringify(options.filename):'undefined';var fn;str=String(str);options.compileDebug=options.compileDebug?true:false;var parsed=parse(str,options);if(options.compileDebug){fn=['var jade_debug = [ new jade.DebugItem( 1, '+filename+' ) ];','try {',parsed.body,'} catch (err) {','  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, '+utils.stringify(str)+');','}'].join('\n');}else {fn=parsed.body;}return {body:'function '+name+'(locals) {\n'+fn+'\n}',dependencies:parsed.dependencies};}; /**
 * Compile a JavaScript source representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *
 * @param {String} str
 * @param {Options} options
 * @return {String}
 * @api public
 */exports.compileClient=function(str,options){return exports.compileClientWithDependenciesTracked(str,options).body;}; /**
 * Compile a `Function` representation of the given jade file.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *
 * @param {String} path
 * @param {Options} options
 * @return {Function}
 * @api public
 */exports.compileFile=function(path,options){options=options||{};options.filename=path;return handleTemplateCache(options);}; /**
 * Render the given `str` of jade.
 *
 * Options:
 *
 *   - `cache` enable template caching
 *   - `filename` filename required for `include` / `extends` and caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */exports.render=function(str,options,fn){ // support callback API
if('function'==typeof options){fn=options,options=undefined;}if(typeof fn==='function'){var res;try{res=exports.render(str,options);}catch(ex){return fn(ex);}return fn(null,res);}options=options||{}; // cache requires .filename
if(options.cache&&!options.filename){throw new Error('the "filename" option is required for caching');}return handleTemplateCache(options,str)(options);}; /**
 * Render a Jade file at the given `path`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */exports.renderFile=function(path,options,fn){ // support callback API
if('function'==typeof options){fn=options,options=undefined;}if(typeof fn==='function'){var res;try{res=exports.renderFile(path,options);}catch(ex){return fn(ex);}return fn(null,res);}options=options||{};options.filename=path;return handleTemplateCache(options)(options);}; /**
 * Compile a Jade file at the given `path` for use on the client.
 *
 * @param {String} path
 * @param {Object} options
 * @returns {String}
 * @api public
 */exports.compileFileClient=function(path,options){var key=path+':client';options=options||{};options.filename=path;if(options.cache&&exports.cache[key]){return exports.cache[key];}var str=fs.readFileSync(options.filename,'utf8');var out=exports.compileClient(str,options);if(options.cache)exports.cache[key]=out;return out;}; /**
 * Express support.
 */exports.__express=function(path,options,fn){if(options.compileDebug==undefined&&process.env.NODE_ENV==='production'){options.compileDebug=false;}exports.renderFile(path,options,fn);};}).call(this,require("FT5ORs"));},{"./compiler":13,"./doctypes":14,"./filters":15,"./lexer":18,"./nodes":28,"./parser":35,"./runtime":36,"./utils":37,"FT5ORs":44,"fs":4,"void-elements":45,"with":46}],17:[function(require,module,exports){'use strict';module.exports=['a','abbr','acronym','b','br','code','em','font','i','img','ins','kbd','map','samp','small','span','strong','sub','sup'];},{}],18:[function(require,module,exports){'use strict';var utils=require('./utils');var characterParser=require('character-parser'); /**
 * Initialize `Lexer` with the given `str`.
 *
 * @param {String} str
 * @param {String} filename
 * @api private
 */var Lexer=module.exports=function Lexer(str,filename){this.input=str.replace(/\r\n|\r/g,'\n');this.filename=filename;this.deferredTokens=[];this.lastIndents=0;this.lineno=1;this.stash=[];this.indentStack=[];this.indentRe=null;this.pipeless=false;};function assertExpression(exp){ //this verifies that a JavaScript expression is valid
Function('','return ('+exp+')');}function assertNestingCorrect(exp){ //this verifies that code is properly nested, but allows
//invalid JavaScript such as the contents of `attributes`
var res=characterParser(exp);if(res.isNesting()){throw new Error('Nesting must match on expression `'+exp+'`');}} /**
 * Lexer prototype.
 */Lexer.prototype={ /**
   * Construct a token with the given `type` and `val`.
   *
   * @param {String} type
   * @param {String} val
   * @return {Object}
   * @api private
   */tok:function tok(type,val){return {type:type,line:this.lineno,val:val};}, /**
   * Consume the given `len` of input.
   *
   * @param {Number} len
   * @api private
   */consume:function consume(len){this.input=this.input.substr(len);}, /**
   * Scan for `type` with the given `regexp`.
   *
   * @param {String} type
   * @param {RegExp} regexp
   * @return {Object}
   * @api private
   */scan:function scan(regexp,type){var captures;if(captures=regexp.exec(this.input)){this.consume(captures[0].length);return this.tok(type,captures[1]);}}, /**
   * Defer the given `tok`.
   *
   * @param {Object} tok
   * @api private
   */defer:function defer(tok){this.deferredTokens.push(tok);}, /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */lookahead:function lookahead(n){var fetch=n-this.stash.length;while(fetch-->0){this.stash.push(this.next());}return this.stash[--n];}, /**
   * Return the indexOf `(` or `{` or `[` / `)` or `}` or `]` delimiters.
   *
   * @return {Number}
   * @api private
   */bracketExpression:function bracketExpression(skip){skip=skip||0;var start=this.input[skip];if(start!='('&&start!='{'&&start!='[')throw new Error('unrecognized start character');var end={'(':')','{':'}','[':']'}[start];var range=characterParser.parseMax(this.input,{start:skip+1});if(this.input[range.end]!==end)throw new Error('start character '+start+' does not match end character '+this.input[range.end]);return range;}, /**
   * Stashed token.
   */stashed:function stashed(){return this.stash.length&&this.stash.shift();}, /**
   * Deferred token.
   */deferred:function deferred(){return this.deferredTokens.length&&this.deferredTokens.shift();}, /**
   * end-of-source.
   */eos:function eos(){if(this.input.length)return;if(this.indentStack.length){this.indentStack.shift();return this.tok('outdent');}else {return this.tok('eos');}}, /**
   * Blank line.
   */blank:function blank(){var captures;if(captures=/^\n *\n/.exec(this.input)){this.consume(captures[0].length-1);++this.lineno;if(this.pipeless)return this.tok('text','');return this.next();}}, /**
   * Comment.
   */comment:function comment(){var captures;if(captures=/^\/\/(-)?([^\n]*)/.exec(this.input)){this.consume(captures[0].length);var tok=this.tok('comment',captures[2]);tok.buffer='-'!=captures[1];this.pipeless=true;return tok;}}, /**
   * Interpolated tag.
   */interpolation:function interpolation(){if(/^#\{/.test(this.input)){var match=this.bracketExpression(1);this.consume(match.end+1);return this.tok('interpolation',match.src);}}, /**
   * Tag.
   */tag:function tag(){var captures;if(captures=/^(\w[-:\w]*)(\/?)/.exec(this.input)){this.consume(captures[0].length);var tok,name=captures[1];if(':'==name[name.length-1]){name=name.slice(0,-1);tok=this.tok('tag',name);this.defer(this.tok(':'));if(this.input[0]!==' '){console.warn('Warning: space required after `:` on line '+this.lineno+' of jade file "'+this.filename+'"');}while(' '==this.input[0]){this.input=this.input.substr(1);}}else {tok=this.tok('tag',name);}tok.selfClosing=!!captures[2];return tok;}}, /**
   * Filter.
   */filter:function filter(){var tok=this.scan(/^:([\w\-]+)/,'filter');if(tok){this.pipeless=true;return tok;}}, /**
   * Doctype.
   */doctype:function doctype(){if(this.scan(/^!!! *([^\n]+)?/,'doctype')){throw new Error('`!!!` is deprecated, you must now use `doctype`');}var node=this.scan(/^(?:doctype) *([^\n]+)?/,'doctype');if(node&&node.val&&node.val.trim()==='5'){throw new Error('`doctype 5` is deprecated, you must now use `doctype html`');}return node;}, /**
   * Id.
   */id:function id(){return this.scan(/^#([\w-]+)/,'id');}, /**
   * Class.
   */className:function className(){return this.scan(/^\.([\w-]+)/,'class');}, /**
   * Text.
   */text:function text(){return this.scan(/^(?:\| ?| )([^\n]+)/,'text')||this.scan(/^\|?( )/,'text')||this.scan(/^(<[^\n]*)/,'text');},textFail:function textFail(){var tok;if(tok=this.scan(/^([^\.\n][^\n]+)/,'text')){console.warn('Warning: missing space before text for line '+this.lineno+' of jade file "'+this.filename+'"');return tok;}}, /**
   * Dot.
   */dot:function dot(){var match;if(match=this.scan(/^\./,'dot')){this.pipeless=true;return match;}}, /**
   * Extends.
   */"extends":function _extends(){return this.scan(/^extends? +([^\n]+)/,'extends');}, /**
   * Block prepend.
   */prepend:function prepend(){var captures;if(captures=/^prepend +([^\n]+)/.exec(this.input)){this.consume(captures[0].length);var mode='prepend',name=captures[1],tok=this.tok('block',name);tok.mode=mode;return tok;}}, /**
   * Block append.
   */append:function append(){var captures;if(captures=/^append +([^\n]+)/.exec(this.input)){this.consume(captures[0].length);var mode='append',name=captures[1],tok=this.tok('block',name);tok.mode=mode;return tok;}}, /**
   * Block.
   */block:function block(){var captures;if(captures=/^block\b *(?:(prepend|append) +)?([^\n]+)/.exec(this.input)){this.consume(captures[0].length);var mode=captures[1]||'replace',name=captures[2],tok=this.tok('block',name);tok.mode=mode;return tok;}}, /**
   * Mixin Block.
   */mixinBlock:function mixinBlock(){var captures;if(captures=/^block[ \t]*(\n|$)/.exec(this.input)){this.consume(captures[0].length-captures[1].length);return this.tok('mixin-block');}}, /**
   * Yield.
   */'yield':function _yield(){return this.scan(/^yield */,'yield');}, /**
   * Include.
   */include:function include(){return this.scan(/^include +([^\n]+)/,'include');}, /**
   * Include with filter
   */includeFiltered:function includeFiltered(){var captures;if(captures=/^include:([\w\-]+)([\( ])/.exec(this.input)){this.consume(captures[0].length-1);var filter=captures[1];var attrs=captures[2]==='('?this.attrs():null;if(!(captures[2]===' '||this.input[0]===' ')){throw new Error('expected space after include:filter but got '+utils.stringify(this.input[0]));}captures=/^ *([^\n]+)/.exec(this.input);if(!captures||captures[1].trim()===''){throw new Error('missing path for include:filter');}this.consume(captures[0].length);var path=captures[1];var tok=this.tok('include',path);tok.filter=filter;tok.attrs=attrs;return tok;}}, /**
   * Case.
   */"case":function _case(){return this.scan(/^case +([^\n]+)/,'case');}, /**
   * When.
   */when:function when(){return this.scan(/^when +([^:\n]+)/,'when');}, /**
   * Default.
   */"default":function _default(){return this.scan(/^default */,'default');}, /**
   * Call mixin.
   */call:function call(){var tok,captures;if(captures=/^\+(\s*)(([-\w]+)|(#\{))/.exec(this.input)){ // try to consume simple or interpolated call
if(captures[3]){ // simple call
this.consume(captures[0].length);tok=this.tok('call',captures[3]);}else { // interpolated call
var match=this.bracketExpression(2+captures[1].length);this.consume(match.end+1);assertExpression(match.src);tok=this.tok('call','#{'+match.src+'}');} // Check for args (not attributes)
if(captures=/^ *\(/.exec(this.input)){var range=this.bracketExpression(captures[0].length-1);if(!/^\s*[-\w]+ *=/.test(range.src)){ // not attributes
this.consume(range.end+1);tok.args=range.src;}if(tok.args){assertExpression('['+tok.args+']');}}return tok;}}, /**
   * Mixin.
   */mixin:function mixin(){var captures;if(captures=/^mixin +([-\w]+)(?: *\((.*)\))? */.exec(this.input)){this.consume(captures[0].length);var tok=this.tok('mixin',captures[1]);tok.args=captures[2];return tok;}}, /**
   * Conditional.
   */conditional:function conditional(){var captures;if(captures=/^(if|unless|else if|else)\b([^\n]*)/.exec(this.input)){this.consume(captures[0].length);var type=captures[1];var js=captures[2];var isIf=false;var isElse=false;switch(type){case 'if':assertExpression(js);js='if ('+js+')';isIf=true;break;case 'unless':assertExpression(js);js='if (!('+js+'))';isIf=true;break;case 'else if':assertExpression(js);js='else if ('+js+')';isIf=true;isElse=true;break;case 'else':if(js&&js.trim()){throw new Error('`else` cannot have a condition, perhaps you meant `else if`');}js='else';isElse=true;break;}var tok=this.tok('code',js);tok.isElse=isElse;tok.isIf=isIf;tok.requiresBlock=true;return tok;}}, /**
   * While.
   */"while":function _while(){var captures;if(captures=/^while +([^\n]+)/.exec(this.input)){this.consume(captures[0].length);assertExpression(captures[1]);var tok=this.tok('code','while ('+captures[1]+')');tok.requiresBlock=true;return tok;}}, /**
   * Each.
   */each:function each(){var captures;if(captures=/^(?:- *)?(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? * in *([^\n]+)/.exec(this.input)){this.consume(captures[0].length);var tok=this.tok('each',captures[1]);tok.key=captures[2]||'$index';assertExpression(captures[3]);tok.code=captures[3];return tok;}}, /**
   * Code.
   */code:function code(){var captures;if(captures=/^(!?=|-)[ \t]*([^\n]+)/.exec(this.input)){this.consume(captures[0].length);var flags=captures[1];captures[1]=captures[2];var tok=this.tok('code',captures[1]);tok.escape=flags.charAt(0)==='=';tok.buffer=flags.charAt(0)==='='||flags.charAt(1)==='=';if(tok.buffer)assertExpression(captures[1]);return tok;}}, /**
   * Block code.
   */blockCode:function blockCode(){var captures;if(captures=/^-\n/.exec(this.input)){this.consume(captures[0].length-1);var tok=this.tok('blockCode');this.pipeless=true;return tok;}}, /**
   * Attributes.
   */attrs:function attrs(){if('('==this.input.charAt(0)){var index=this.bracketExpression().end,str=this.input.substr(1,index-1),tok=this.tok('attrs');assertNestingCorrect(str);var quote='';var interpolate=function interpolate(attr){return attr.replace(/(\\)?#\{(.+)/g,function(_,escape,expr){if(escape)return _;try{var range=characterParser.parseMax(expr);if(expr[range.end]!=='}')return _.substr(0,2)+interpolate(_.substr(2));assertExpression(range.src);return quote+" + ("+range.src+") + "+quote+interpolate(expr.substr(range.end+1));}catch(ex){return _.substr(0,2)+interpolate(_.substr(2));}});};this.consume(index+1);tok.attrs=[];var escapedAttr=true;var key='';var val='';var interpolatable='';var state=characterParser.defaultState();var loc='key';var isEndOfAttribute=function isEndOfAttribute(i){if(key.trim()==='')return false;if(i===str.length)return true;if(loc==='key'){if(str[i]===' '||str[i]==='\n'){for(var x=i;x<str.length;x++){if(str[x]!=' '&&str[x]!='\n'){if(str[x]==='='||str[x]==='!'||str[x]===',')return false;else return true;}}}return str[i]===',';}else if(loc==='value'&&!state.isNesting()){try{assertExpression(val);if(str[i]===' '||str[i]==='\n'){for(var x=i;x<str.length;x++){if(str[x]!=' '&&str[x]!='\n'){if(characterParser.isPunctuator(str[x])&&str[x]!='"'&&str[x]!="'")return false;else return true;}}}return str[i]===',';}catch(ex){return false;}}};this.lineno+=str.split("\n").length-1;for(var i=0;i<=str.length;i++){if(isEndOfAttribute(i)){val=val.trim();if(val)assertExpression(val);key=key.trim();key=key.replace(/^['"]|['"]$/g,'');tok.attrs.push({name:key,val:''==val?true:val,escaped:escapedAttr});key=val='';loc='key';escapedAttr=false;}else {switch(loc){case 'key-char':if(str[i]===quote){loc='key';if(i+1<str.length&&[' ',',','!','=','\n'].indexOf(str[i+1])===-1)throw new Error('Unexpected character '+str[i+1]+' expected ` `, `\\n`, `,`, `!` or `=`');}else {key+=str[i];}break;case 'key':if(key===''&&(str[i]==='"'||str[i]==="'")){loc='key-char';quote=str[i];}else if(str[i]==='!'||str[i]==='='){escapedAttr=str[i]!=='!';if(str[i]==='!')i++;if(str[i]!=='=')throw new Error('Unexpected character '+str[i]+' expected `=`');loc='value';state=characterParser.defaultState();}else {key+=str[i];}break;case 'value':state=characterParser.parseChar(str[i],state);if(state.isString()){loc='string';quote=str[i];interpolatable=str[i];}else {val+=str[i];}break;case 'string':state=characterParser.parseChar(str[i],state);interpolatable+=str[i];if(!state.isString()){loc='value';val+=interpolate(interpolatable);}break;}}}if('/'==this.input.charAt(0)){this.consume(1);tok.selfClosing=true;}return tok;}}, /**
   * &attributes block
   */attributesBlock:function attributesBlock(){var captures;if(/^&attributes\b/.test(this.input)){this.consume(11);var args=this.bracketExpression();this.consume(args.end+1);return this.tok('&attributes',args.src);}}, /**
   * Indent | Outdent | Newline.
   */indent:function indent(){var captures,re; // established regexp
if(this.indentRe){captures=this.indentRe.exec(this.input); // determine regexp
}else { // tabs
re=/^\n(\t*) */;captures=re.exec(this.input); // spaces
if(captures&&!captures[1].length){re=/^\n( *)/;captures=re.exec(this.input);} // established
if(captures&&captures[1].length)this.indentRe=re;}if(captures){var tok,indents=captures[1].length;++this.lineno;this.consume(indents+1);if(' '==this.input[0]||'\t'==this.input[0]){throw new Error('Invalid indentation, you can use tabs or spaces but not both');} // blank line
if('\n'==this.input[0]){this.pipeless=false;return this.tok('newline');} // outdent
if(this.indentStack.length&&indents<this.indentStack[0]){while(this.indentStack.length&&this.indentStack[0]>indents){this.stash.push(this.tok('outdent'));this.indentStack.shift();}tok=this.stash.pop(); // indent
}else if(indents&&indents!=this.indentStack[0]){this.indentStack.unshift(indents);tok=this.tok('indent',indents); // newline
}else {tok=this.tok('newline');}this.pipeless=false;return tok;}}, /**
   * Pipe-less text consumed only when
   * pipeless is true;
   */pipelessText:function pipelessText(){if(!this.pipeless)return;var captures,re; // established regexp
if(this.indentRe){captures=this.indentRe.exec(this.input); // determine regexp
}else { // tabs
re=/^\n(\t*) */;captures=re.exec(this.input); // spaces
if(captures&&!captures[1].length){re=/^\n( *)/;captures=re.exec(this.input);} // established
if(captures&&captures[1].length)this.indentRe=re;}var indents=captures&&captures[1].length;if(indents&&(this.indentStack.length===0||indents>this.indentStack[0])){var indent=captures[1];var line;var tokens=[];var isMatch;do { // text has `\n` as a prefix
var i=this.input.substr(1).indexOf('\n');if(-1==i)i=this.input.length-1;var str=this.input.substr(1,i);isMatch=str.substr(0,indent.length)===indent||!str.trim();if(isMatch){ // consume test along with `\n` prefix if match
this.consume(str.length+1);++this.lineno;tokens.push(str.substr(indent.length));}}while(this.input.length&&isMatch);while(this.input.length===0&&tokens[tokens.length-1]===''){tokens.pop();}return this.tok('pipeless-text',tokens);}}, /**
   * ':'
   */colon:function colon(){var good=/^: +/.test(this.input);var res=this.scan(/^: */,':');if(res&&!good){console.warn('Warning: space required after `:` on line '+this.lineno+' of jade file "'+this.filename+'"');}return res;},fail:function fail(){throw new Error('unexpected text '+this.input.substr(0,5));}, /**
   * Return the next token object, or those
   * previously stashed by lookahead.
   *
   * @return {Object}
   * @api private
   */advance:function advance(){return this.stashed()||this.next();}, /**
   * Return the next token object.
   *
   * @return {Object}
   * @api private
   */next:function next(){return this.deferred()||this.blank()||this.eos()||this.pipelessText()||this.yield()||this.doctype()||this.interpolation()||this["case"]()||this.when()||this["default"]()||this["extends"]()||this.append()||this.prepend()||this.block()||this.mixinBlock()||this.include()||this.includeFiltered()||this.mixin()||this.call()||this.conditional()||this.each()||this["while"]()||this.tag()||this.filter()||this.blockCode()||this.code()||this.id()||this.className()||this.attrs()||this.attributesBlock()||this.indent()||this.text()||this.comment()||this.colon()||this.dot()||this.textFail()||this.fail();}};},{"./utils":37,"character-parser":5}],19:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `Attrs` node.
 *
 * @api public
 */var Attrs=module.exports=function Attrs(){this.attributeNames=[];this.attrs=[];this.attributeBlocks=[];}; // Inherit from `Node`.
Attrs.prototype=Object.create(Node.prototype);Attrs.prototype.constructor=Attrs;Attrs.prototype.type='Attrs'; /**
 * Set attribute `name` to `val`, keep in mind these become
 * part of a raw js object literal, so to quote a value you must
 * '"quote me"', otherwise or example 'user.name' is literal JavaScript.
 *
 * @param {String} name
 * @param {String} val
 * @param {Boolean} escaped
 * @return {Tag} for chaining
 * @api public
 */Attrs.prototype.setAttribute=function(name,val,escaped){if(name!=='class'&&this.attributeNames.indexOf(name)!==-1){throw new Error('Duplicate attribute "'+name+'" is not allowed.');}this.attributeNames.push(name);this.attrs.push({name:name,val:val,escaped:escaped});return this;}; /**
 * Remove attribute `name` when present.
 *
 * @param {String} name
 * @api public
 */Attrs.prototype.removeAttribute=function(name){var err=new Error('attrs.removeAttribute is deprecated and will be removed in v2.0.0');console.warn(err.stack);for(var i=0,len=this.attrs.length;i<len;++i){if(this.attrs[i]&&this.attrs[i].name==name){delete this.attrs[i];}}}; /**
 * Get attribute value by `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */Attrs.prototype.getAttribute=function(name){var err=new Error('attrs.getAttribute is deprecated and will be removed in v2.0.0');console.warn(err.stack);for(var i=0,len=this.attrs.length;i<len;++i){if(this.attrs[i]&&this.attrs[i].name==name){return this.attrs[i].val;}}};Attrs.prototype.addAttributes=function(src){this.attributeBlocks.push(src);};},{"./node":32}],20:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `BlockComment` with the given `block`.
 *
 * @param {String} val
 * @param {Block} block
 * @param {Boolean} buffer
 * @api public
 */var BlockComment=module.exports=function BlockComment(val,block,buffer){this.block=block;this.val=val;this.buffer=buffer;}; // Inherit from `Node`.
BlockComment.prototype=Object.create(Node.prototype);BlockComment.prototype.constructor=BlockComment;BlockComment.prototype.type='BlockComment';},{"./node":32}],21:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a new `Block` with an optional `node`.
 *
 * @param {Node} node
 * @api public
 */var Block=module.exports=function Block(node){this.nodes=[];if(node)this.push(node);}; // Inherit from `Node`.
Block.prototype=Object.create(Node.prototype);Block.prototype.constructor=Block;Block.prototype.type='Block'; /**
 * Block flag.
 */Block.prototype.isBlock=true; /**
 * Replace the nodes in `other` with the nodes
 * in `this` block.
 *
 * @param {Block} other
 * @api private
 */Block.prototype.replace=function(other){var err=new Error('block.replace is deprecated and will be removed in v2.0.0');console.warn(err.stack);other.nodes=this.nodes;}; /**
 * Push the given `node`.
 *
 * @param {Node} node
 * @return {Number}
 * @api public
 */Block.prototype.push=function(node){return this.nodes.push(node);}; /**
 * Check if this block is empty.
 *
 * @return {Boolean}
 * @api public
 */Block.prototype.isEmpty=function(){return 0==this.nodes.length;}; /**
 * Unshift the given `node`.
 *
 * @param {Node} node
 * @return {Number}
 * @api public
 */Block.prototype.unshift=function(node){return this.nodes.unshift(node);}; /**
 * Return the "last" block, or the first `yield` node.
 *
 * @return {Block}
 * @api private
 */Block.prototype.includeBlock=function(){var ret=this,node;for(var i=0,len=this.nodes.length;i<len;++i){node=this.nodes[i];if(node.yield)return node;else if(node.textOnly)continue;else if(node.includeBlock)ret=node.includeBlock();else if(node.block&&!node.block.isEmpty())ret=node.block.includeBlock();if(ret.yield)return ret;}return ret;}; /**
 * Return a clone of this block.
 *
 * @return {Block}
 * @api private
 */Block.prototype.clone=function(){var err=new Error('block.clone is deprecated and will be removed in v2.0.0');console.warn(err.stack);var clone=new Block();for(var i=0,len=this.nodes.length;i<len;++i){clone.push(this.nodes[i].clone());}return clone;};},{"./node":32}],22:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a new `Case` with `expr`.
 *
 * @param {String} expr
 * @api public
 */var Case=exports=module.exports=function Case(expr,block){this.expr=expr;this.block=block;}; // Inherit from `Node`.
Case.prototype=Object.create(Node.prototype);Case.prototype.constructor=Case;Case.prototype.type='Case';var When=exports.When=function When(expr,block){this.expr=expr;this.block=block;this.debug=false;}; // Inherit from `Node`.
When.prototype=Object.create(Node.prototype);When.prototype.constructor=When;When.prototype.type='When';},{"./node":32}],23:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `Code` node with the given code `val`.
 * Code may also be optionally buffered and escaped.
 *
 * @param {String} val
 * @param {Boolean} buffer
 * @param {Boolean} escape
 * @api public
 */var Code=module.exports=function Code(val,buffer,escape){this.val=val;this.buffer=buffer;this.escape=escape;if(val.match(/^ *else/))this.debug=false;}; // Inherit from `Node`.
Code.prototype=Object.create(Node.prototype);Code.prototype.constructor=Code;Code.prototype.type='Code'; // prevent the minifiers removing this
},{"./node":32}],24:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `Comment` with the given `val`, optionally `buffer`,
 * otherwise the comment may render in the output.
 *
 * @param {String} val
 * @param {Boolean} buffer
 * @api public
 */var Comment=module.exports=function Comment(val,buffer){this.val=val;this.buffer=buffer;}; // Inherit from `Node`.
Comment.prototype=Object.create(Node.prototype);Comment.prototype.constructor=Comment;Comment.prototype.type='Comment';},{"./node":32}],25:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `Doctype` with the given `val`. 
 *
 * @param {String} val
 * @api public
 */var Doctype=module.exports=function Doctype(val){this.val=val;}; // Inherit from `Node`.
Doctype.prototype=Object.create(Node.prototype);Doctype.prototype.constructor=Doctype;Doctype.prototype.type='Doctype';},{"./node":32}],26:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize an `Each` node, representing iteration
 *
 * @param {String} obj
 * @param {String} val
 * @param {String} key
 * @param {Block} block
 * @api public
 */var Each=module.exports=function Each(obj,val,key,block){this.obj=obj;this.val=val;this.key=key;this.block=block;}; // Inherit from `Node`.
Each.prototype=Object.create(Node.prototype);Each.prototype.constructor=Each;Each.prototype.type='Each';},{"./node":32}],27:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `Filter` node with the given
 * filter `name` and `block`.
 *
 * @param {String} name
 * @param {Block|Node} block
 * @api public
 */var Filter=module.exports=function Filter(name,block,attrs){this.name=name;this.block=block;this.attrs=attrs;}; // Inherit from `Node`.
Filter.prototype=Object.create(Node.prototype);Filter.prototype.constructor=Filter;Filter.prototype.type='Filter';},{"./node":32}],28:[function(require,module,exports){'use strict';exports.Node=require('./node');exports.Tag=require('./tag');exports.Code=require('./code');exports.Each=require('./each');exports.Case=require('./case');exports.Text=require('./text');exports.Block=require('./block');exports.MixinBlock=require('./mixin-block');exports.Mixin=require('./mixin');exports.Filter=require('./filter');exports.Comment=require('./comment');exports.Literal=require('./literal');exports.BlockComment=require('./block-comment');exports.Doctype=require('./doctype');},{"./block":21,"./block-comment":20,"./case":22,"./code":23,"./comment":24,"./doctype":25,"./each":26,"./filter":27,"./literal":29,"./mixin":31,"./mixin-block":30,"./node":32,"./tag":33,"./text":34}],29:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `Literal` node with the given `str.
 *
 * @param {String} str
 * @api public
 */var Literal=module.exports=function Literal(str){this.str=str;}; // Inherit from `Node`.
Literal.prototype=Object.create(Node.prototype);Literal.prototype.constructor=Literal;Literal.prototype.type='Literal';},{"./node":32}],30:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a new `Block` with an optional `node`.
 *
 * @param {Node} node
 * @api public
 */var MixinBlock=module.exports=function MixinBlock(){}; // Inherit from `Node`.
MixinBlock.prototype=Object.create(Node.prototype);MixinBlock.prototype.constructor=MixinBlock;MixinBlock.prototype.type='MixinBlock';},{"./node":32}],31:[function(require,module,exports){'use strict';var Attrs=require('./attrs'); /**
 * Initialize a new `Mixin` with `name` and `block`.
 *
 * @param {String} name
 * @param {String} args
 * @param {Block} block
 * @api public
 */var Mixin=module.exports=function Mixin(name,args,block,call){Attrs.call(this);this.name=name;this.args=args;this.block=block;this.call=call;}; // Inherit from `Attrs`.
Mixin.prototype=Object.create(Attrs.prototype);Mixin.prototype.constructor=Mixin;Mixin.prototype.type='Mixin';},{"./attrs":19}],32:[function(require,module,exports){'use strict';var Node=module.exports=function Node(){}; /**
 * Clone this node (return itself)
 *
 * @return {Node}
 * @api private
 */Node.prototype.clone=function(){var err=new Error('node.clone is deprecated and will be removed in v2.0.0');console.warn(err.stack);return this;};Node.prototype.type='';},{}],33:[function(require,module,exports){'use strict';var Attrs=require('./attrs');var Block=require('./block');var inlineTags=require('../inline-tags'); /**
 * Initialize a `Tag` node with the given tag `name` and optional `block`.
 *
 * @param {String} name
 * @param {Block} block
 * @api public
 */var Tag=module.exports=function Tag(name,block){Attrs.call(this);this.name=name;this.block=block||new Block();}; // Inherit from `Attrs`.
Tag.prototype=Object.create(Attrs.prototype);Tag.prototype.constructor=Tag;Tag.prototype.type='Tag'; /**
 * Clone this tag.
 *
 * @return {Tag}
 * @api private
 */Tag.prototype.clone=function(){var err=new Error('tag.clone is deprecated and will be removed in v2.0.0');console.warn(err.stack);var clone=new Tag(this.name,this.block.clone());clone.line=this.line;clone.attrs=this.attrs;clone.textOnly=this.textOnly;return clone;}; /**
 * Check if this tag is an inline tag.
 *
 * @return {Boolean}
 * @api private
 */Tag.prototype.isInline=function(){return ~inlineTags.indexOf(this.name);}; /**
 * Check if this tag's contents can be inlined.  Used for pretty printing.
 *
 * @return {Boolean}
 * @api private
 */Tag.prototype.canInline=function(){var nodes=this.block.nodes;function isInline(node){ // Recurse if the node is a block
if(node.isBlock)return node.nodes.every(isInline);return node.isText||node.isInline&&node.isInline();} // Empty tag
if(!nodes.length)return true; // Text-only or inline-only tag
if(1==nodes.length)return isInline(nodes[0]); // Multi-line inline-only tag
if(this.block.nodes.every(isInline)){for(var i=1,len=nodes.length;i<len;++i){if(nodes[i-1].isText&&nodes[i].isText)return false;}return true;} // Mixed tag
return false;};},{"../inline-tags":17,"./attrs":19,"./block":21}],34:[function(require,module,exports){'use strict';var Node=require('./node'); /**
 * Initialize a `Text` node with optional `line`.
 *
 * @param {String} line
 * @api public
 */var Text=module.exports=function Text(line){this.val=line;}; // Inherit from `Node`.
Text.prototype=Object.create(Node.prototype);Text.prototype.constructor=Text;Text.prototype.type='Text'; /**
 * Flag as text.
 */Text.prototype.isText=true;},{"./node":32}],35:[function(require,module,exports){'use strict';var Lexer=require('./lexer');var nodes=require('./nodes');var utils=require('./utils');var filters=require('./filters');var path=require('path');var constantinople=require('constantinople');var parseJSExpression=require('character-parser').parseMax;var extname=path.extname; /**
 * Initialize `Parser` with the given input `str` and `filename`.
 *
 * @param {String} str
 * @param {String} filename
 * @param {Object} options
 * @api public
 */var Parser=exports=module.exports=function Parser(str,filename,options){ //Strip any UTF-8 BOM off of the start of `str`, if it exists.
this.input=str.replace(/^\uFEFF/,'');this.lexer=new Lexer(this.input,filename);this.filename=filename;this.blocks={};this.mixins={};this.options=options;this.contexts=[this];this.inMixin=0;this.dependencies=[];this.inBlock=0;}; /**
 * Parser prototype.
 */Parser.prototype={ /**
   * Save original constructor
   */constructor:Parser, /**
   * Push `parser` onto the context stack,
   * or pop and return a `Parser`.
   */context:function context(parser){if(parser){this.contexts.push(parser);}else {return this.contexts.pop();}}, /**
   * Return the next token object.
   *
   * @return {Object}
   * @api private
   */advance:function advance(){return this.lexer.advance();}, /**
   * Single token lookahead.
   *
   * @return {Object}
   * @api private
   */peek:function peek(){return this.lookahead(1);}, /**
   * Return lexer lineno.
   *
   * @return {Number}
   * @api private
   */line:function line(){return this.lexer.lineno;}, /**
   * `n` token lookahead.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */lookahead:function lookahead(n){return this.lexer.lookahead(n);}, /**
   * Parse input returning a string of js for evaluation.
   *
   * @return {String}
   * @api public
   */parse:function parse(){var block=new nodes.Block(),parser;block.line=0;block.filename=this.filename;while('eos'!=this.peek().type){if('newline'==this.peek().type){this.advance();}else {var next=this.peek();var expr=this.parseExpr();expr.filename=expr.filename||this.filename;expr.line=next.line;block.push(expr);}}if(parser=this.extending){this.context(parser);var ast=parser.parse();this.context(); // hoist mixins
for(var name in this.mixins){ast.unshift(this.mixins[name]);}return ast;}if(!this.extending&&!this.included&&Object.keys(this.blocks).length){var blocks=[];utils.walkAST(block,function(node){if(node.type==='Block'&&node.name){blocks.push(node.name);}});Object.keys(this.blocks).forEach(function(name){if(blocks.indexOf(name)===-1&&!this.blocks[name].isSubBlock){console.warn('Warning: Unexpected block "'+name+'" '+' on line '+this.blocks[name].line+' of '+this.blocks[name].filename+'. This block is never used. This warning will be an error in v2.0.0');}}.bind(this));}return block;}, /**
   * Expect the given type, or throw an exception.
   *
   * @param {String} type
   * @api private
   */expect:function expect(type){if(this.peek().type===type){return this.advance();}else {throw new Error('expected "'+type+'", but got "'+this.peek().type+'"');}}, /**
   * Accept the given `type`.
   *
   * @param {String} type
   * @api private
   */accept:function accept(type){if(this.peek().type===type){return this.advance();}}, /**
   *   tag
   * | doctype
   * | mixin
   * | include
   * | filter
   * | comment
   * | text
   * | each
   * | code
   * | yield
   * | id
   * | class
   * | interpolation
   */parseExpr:function parseExpr(){switch(this.peek().type){case 'tag':return this.parseTag();case 'mixin':return this.parseMixin();case 'block':return this.parseBlock();case 'mixin-block':return this.parseMixinBlock();case 'case':return this.parseCase();case 'extends':return this.parseExtends();case 'include':return this.parseInclude();case 'doctype':return this.parseDoctype();case 'filter':return this.parseFilter();case 'comment':return this.parseComment();case 'text':return this.parseText();case 'each':return this.parseEach();case 'code':return this.parseCode();case 'blockCode':return this.parseBlockCode();case 'call':return this.parseCall();case 'interpolation':return this.parseInterpolation();case 'yield':this.advance();var block=new nodes.Block();block.yield=true;return block;case 'id':case 'class':var tok=this.advance();this.lexer.defer(this.lexer.tok('tag','div'));this.lexer.defer(tok);return this.parseExpr();default:throw new Error('unexpected token "'+this.peek().type+'"');}}, /**
   * Text
   */parseText:function parseText(){var tok=this.expect('text');var tokens=this.parseInlineTagsInText(tok.val);if(tokens.length===1)return tokens[0];var node=new nodes.Block();for(var i=0;i<tokens.length;i++){node.push(tokens[i]);};return node;}, /**
   *   ':' expr
   * | block
   */parseBlockExpansion:function parseBlockExpansion(){if(':'==this.peek().type){this.advance();return new nodes.Block(this.parseExpr());}else {return this.block();}}, /**
   * case
   */parseCase:function parseCase(){var val=this.expect('case').val;var node=new nodes.Case(val);node.line=this.line();var block=new nodes.Block();block.line=this.line();block.filename=this.filename;this.expect('indent');while('outdent'!=this.peek().type){switch(this.peek().type){case 'comment':case 'newline':this.advance();break;case 'when':block.push(this.parseWhen());break;case 'default':block.push(this.parseDefault());break;default:throw new Error('Unexpected token "'+this.peek().type+'", expected "when", "default" or "newline"');}}this.expect('outdent');node.block=block;return node;}, /**
   * when
   */parseWhen:function parseWhen(){var val=this.expect('when').val;if(this.peek().type!=='newline')return new nodes.Case.When(val,this.parseBlockExpansion());else return new nodes.Case.When(val);}, /**
   * default
   */parseDefault:function parseDefault(){this.expect('default');return new nodes.Case.When('default',this.parseBlockExpansion());}, /**
   * code
   */parseCode:function parseCode(afterIf){var tok=this.expect('code');var node=new nodes.Code(tok.val,tok.buffer,tok.escape);var block;node.line=this.line(); // throw an error if an else does not have an if
if(tok.isElse&&!tok.hasIf){throw new Error('Unexpected else without if');} // handle block
block='indent'==this.peek().type;if(block){node.block=this.block();} // handle missing block
if(tok.requiresBlock&&!block){node.block=new nodes.Block();} // mark presense of if for future elses
if(tok.isIf&&this.peek().isElse){this.peek().hasIf=true;}else if(tok.isIf&&this.peek().type==='newline'&&this.lookahead(2).isElse){this.lookahead(2).hasIf=true;}return node;}, /**
   * block code
   */parseBlockCode:function parseBlockCode(){var tok=this.expect('blockCode');var node;var body=this.peek();var text;if(body.type==='pipeless-text'){this.advance();text=body.val.join('\n');}else {text='';}node=new nodes.Code(text,false,false);return node;}, /**
   * comment
   */parseComment:function parseComment(){var tok=this.expect('comment');var node;var block;if(block=this.parseTextBlock()){node=new nodes.BlockComment(tok.val,block,tok.buffer);}else {node=new nodes.Comment(tok.val,tok.buffer);}node.line=this.line();return node;}, /**
   * doctype
   */parseDoctype:function parseDoctype(){var tok=this.expect('doctype');var node=new nodes.Doctype(tok.val);node.line=this.line();return node;}, /**
   * filter attrs? text-block
   */parseFilter:function parseFilter(){var tok=this.expect('filter');var attrs=this.accept('attrs');var block;block=this.parseTextBlock()||new nodes.Block();var options={};if(attrs){attrs.attrs.forEach(function(attribute){options[attribute.name]=constantinople.toConstant(attribute.val);});}var node=new nodes.Filter(tok.val,block,options);node.line=this.line();return node;}, /**
   * each block
   */parseEach:function parseEach(){var tok=this.expect('each');var node=new nodes.Each(tok.code,tok.val,tok.key);node.line=this.line();node.block=this.block();if(this.peek().type=='code'&&this.peek().val=='else'){this.advance();node.alternative=this.block();}return node;}, /**
   * Resolves a path relative to the template for use in
   * includes and extends
   *
   * @param {String}  path
   * @param {String}  purpose  Used in error messages.
   * @return {String}
   * @api private
   */resolvePath:function resolvePath(path,purpose){var p=require('path');var dirname=p.dirname;var basename=p.basename;var join=p.join;if(path[0]!=='/'&&!this.filename)throw new Error('the "filename" option is required to use "'+purpose+'" with "relative" paths');if(path[0]==='/'&&!this.options.basedir)throw new Error('the "basedir" option is required to use "'+purpose+'" with "absolute" paths');path=join(path[0]==='/'?this.options.basedir:dirname(this.filename),path);if(basename(path).indexOf('.')===-1)path+='.jade';return path;}, /**
   * 'extends' name
   */parseExtends:function parseExtends(){var fs=require('fs');var path=this.resolvePath(this.expect('extends').val.trim(),'extends');if('.jade'!=path.substr(-5))path+='.jade';this.dependencies.push(path);var str=fs.readFileSync(path,'utf8');var parser=new this.constructor(str,path,this.options);parser.dependencies=this.dependencies;parser.blocks=this.blocks;parser.included=this.included;parser.contexts=this.contexts;this.extending=parser; // TODO: null node
return new nodes.Literal('');}, /**
   * 'block' name block
   */parseBlock:function parseBlock(){var block=this.expect('block');var mode=block.mode;var name=block.val.trim();var line=block.line;this.inBlock++;block='indent'==this.peek().type?this.block():new nodes.Block(new nodes.Literal(''));this.inBlock--;block.name=name;block.line=line;var prev=this.blocks[name]||{prepended:[],appended:[]};if(prev.mode==='replace')return this.blocks[name]=prev;var allNodes=prev.prepended.concat(block.nodes).concat(prev.appended);switch(mode){case 'append':prev.appended=prev.parser===this?prev.appended.concat(block.nodes):block.nodes.concat(prev.appended);break;case 'prepend':prev.prepended=prev.parser===this?block.nodes.concat(prev.prepended):prev.prepended.concat(block.nodes);break;}block.nodes=allNodes;block.appended=prev.appended;block.prepended=prev.prepended;block.mode=mode;block.parser=this;block.isSubBlock=this.inBlock>0;return this.blocks[name]=block;},parseMixinBlock:function parseMixinBlock(){var block=this.expect('mixin-block');if(!this.inMixin){throw new Error('Anonymous blocks are not allowed unless they are part of a mixin.');}return new nodes.MixinBlock();}, /**
   * include block?
   */parseInclude:function parseInclude(){var fs=require('fs');var tok=this.expect('include');var path=this.resolvePath(tok.val.trim(),'include');this.dependencies.push(path); // has-filter
if(tok.filter){var str=fs.readFileSync(path,'utf8').replace(/\r/g,'');var options={filename:path};if(tok.attrs){tok.attrs.attrs.forEach(function(attribute){options[attribute.name]=constantinople.toConstant(attribute.val);});}str=filters(tok.filter,str,options);return new nodes.Literal(str);} // non-jade
if('.jade'!=path.substr(-5)){var str=fs.readFileSync(path,'utf8').replace(/\r/g,'');return new nodes.Literal(str);}var str=fs.readFileSync(path,'utf8');var parser=new this.constructor(str,path,this.options);parser.dependencies=this.dependencies;parser.blocks=utils.merge({},this.blocks);parser.included=true;parser.mixins=this.mixins;this.context(parser);var ast=parser.parse();this.context();ast.filename=path;if('indent'==this.peek().type){ast.includeBlock().push(this.block());}return ast;}, /**
   * call ident block
   */parseCall:function parseCall(){var tok=this.expect('call');var name=tok.val;var args=tok.args;var mixin=new nodes.Mixin(name,args,new nodes.Block(),true);this.tag(mixin);if(mixin.code){mixin.block.push(mixin.code);mixin.code=null;}if(mixin.block.isEmpty())mixin.block=null;return mixin;}, /**
   * mixin block
   */parseMixin:function parseMixin(){var tok=this.expect('mixin');var name=tok.val;var args=tok.args;var mixin; // definition
if('indent'==this.peek().type){this.inMixin++;mixin=new nodes.Mixin(name,args,this.block(),false);this.mixins[name]=mixin;this.inMixin--;return mixin; // call
}else {return new nodes.Mixin(name,args,null,true);}},parseInlineTagsInText:function parseInlineTagsInText(str){var line=this.line();var match=/(\\)?#\[((?:.|\n)*)$/.exec(str);if(match){if(match[1]){ // escape
var text=new nodes.Text(str.substr(0,match.index)+'#[');text.line=line;var rest=this.parseInlineTagsInText(match[2]);if(rest[0].type==='Text'){text.val+=rest[0].val;rest.shift();}return [text].concat(rest);}else {var text=new nodes.Text(str.substr(0,match.index));text.line=line;var buffer=[text];var rest=match[2];var range=parseJSExpression(rest);var inner=new Parser(range.src,this.filename,this.options);buffer.push(inner.parse());return buffer.concat(this.parseInlineTagsInText(rest.substr(range.end+1)));}}else {var text=new nodes.Text(str);text.line=line;return [text];}}, /**
   * indent (text | newline)* outdent
   */parseTextBlock:function parseTextBlock(){var block=new nodes.Block();block.line=this.line();var body=this.peek();if(body.type!=='pipeless-text')return;this.advance();block.nodes=body.val.reduce(function(accumulator,text){return accumulator.concat(this.parseInlineTagsInText(text));}.bind(this),[]);return block;}, /**
   * indent expr* outdent
   */block:function block(){var block=new nodes.Block();block.line=this.line();block.filename=this.filename;this.expect('indent');while('outdent'!=this.peek().type){if('newline'==this.peek().type){this.advance();}else {var expr=this.parseExpr();expr.filename=this.filename;block.push(expr);}}this.expect('outdent');return block;}, /**
   * interpolation (attrs | class | id)* (text | code | ':')? newline* block?
   */parseInterpolation:function parseInterpolation(){var tok=this.advance();var tag=new nodes.Tag(tok.val);tag.buffer=true;return this.tag(tag);}, /**
   * tag (attrs | class | id)* (text | code | ':')? newline* block?
   */parseTag:function parseTag(){var tok=this.advance();var tag=new nodes.Tag(tok.val);tag.selfClosing=tok.selfClosing;return this.tag(tag);}, /**
   * Parse tag.
   */tag:function tag(_tag){_tag.line=this.line();var seenAttrs=false; // (attrs | class | id)*
out: while(true){switch(this.peek().type){case 'id':case 'class':var tok=this.advance();_tag.setAttribute(tok.type,"'"+tok.val+"'");continue;case 'attrs':if(seenAttrs){console.warn(this.filename+', line '+this.peek().line+':\nYou should not have jade tags with multiple attributes.');}seenAttrs=true;var tok=this.advance();var attrs=tok.attrs;if(tok.selfClosing)_tag.selfClosing=true;for(var i=0;i<attrs.length;i++){_tag.setAttribute(attrs[i].name,attrs[i].val,attrs[i].escaped);}continue;case '&attributes':var tok=this.advance();_tag.addAttributes(tok.val);break;default:break out;}} // check immediate '.'
if('dot'==this.peek().type){_tag.textOnly=true;this.advance();} // (text | code | ':')?
switch(this.peek().type){case 'text':_tag.block.push(this.parseText());break;case 'code':_tag.code=this.parseCode();break;case ':':this.advance();_tag.block=new nodes.Block();_tag.block.push(this.parseExpr());break;case 'newline':case 'indent':case 'outdent':case 'eos':case 'pipeless-text':break;default:throw new Error('Unexpected token `'+this.peek().type+'` expected `text`, `code`, `:`, `newline` or `eos`');} // newline*
while('newline'==this.peek().type){this.advance();} // block?
if(_tag.textOnly){_tag.block=this.parseTextBlock()||new nodes.Block();}else if('indent'==this.peek().type){var block=this.block();for(var i=0,len=block.nodes.length;i<len;++i){_tag.block.push(block.nodes[i]);}}return _tag;}};},{"./filters":15,"./lexer":18,"./nodes":28,"./utils":37,"character-parser":5,"constantinople":6,"fs":4,"path":42}],36:[function(require,module,exports){'use strict'; /**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */exports.merge=function merge(a,b){if(arguments.length===1){var attrs=a[0];for(var i=1;i<a.length;i++){attrs=merge(attrs,a[i]);}return attrs;}var ac=a['class'];var bc=b['class'];if(ac||bc){ac=ac||[];bc=bc||[];if(!Array.isArray(ac))ac=[ac];if(!Array.isArray(bc))bc=[bc];a['class']=ac.concat(bc).filter(nulls);}for(var key in b){if(key!='class'){a[key]=b[key];}}return a;}; /**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */function nulls(val){return val!=null&&val!=='';} /**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */exports.joinClasses=joinClasses;function joinClasses(val){return (Array.isArray(val)?val.map(joinClasses):val&&(typeof val==="undefined"?"undefined":_typeof(val))==='object'?Object.keys(val).filter(function(key){return val[key];}):[val]).filter(nulls).join(' ');} /**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */exports.cls=function cls(classes,escaped){var buf=[];for(var i=0;i<classes.length;i++){if(escaped&&escaped[i]){buf.push(exports.escape(joinClasses([classes[i]])));}else {buf.push(joinClasses(classes[i]));}}var text=joinClasses(buf);if(text.length){return ' class="'+text+'"';}else {return '';}};exports.style=function(val){if(val&&(typeof val==="undefined"?"undefined":_typeof(val))==='object'){return Object.keys(val).map(function(style){return style+':'+val[style];}).join(';');}else {return val;}}; /**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */exports.attr=function attr(key,val,escaped,terse){if(key==='style'){val=exports.style(val);}if('boolean'==typeof val||null==val){if(val){return ' '+(terse?key:key+'="'+key+'"');}else {return '';}}else if(0==key.indexOf('data')&&'string'!=typeof val){if(JSON.stringify(val).indexOf('&')!==-1){console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes '+'will be escaped to `&amp;`');};if(val&&typeof val.toISOString==='function'){console.warn('Jade will eliminate the double quotes around dates in '+'ISO form after 2.0.0');}return ' '+key+"='"+JSON.stringify(val).replace(/'/g,'&apos;')+"'";}else if(escaped){if(val&&typeof val.toISOString==='function'){console.warn('Jade will stringify dates in ISO form after 2.0.0');}return ' '+key+'="'+exports.escape(val)+'"';}else {if(val&&typeof val.toISOString==='function'){console.warn('Jade will stringify dates in ISO form after 2.0.0');}return ' '+key+'="'+val+'"';}}; /**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */exports.attrs=function attrs(obj,terse){var buf=[];var keys=Object.keys(obj);if(keys.length){for(var i=0;i<keys.length;++i){var key=keys[i],val=obj[key];if('class'==key){if(val=joinClasses(val)){buf.push(' '+key+'="'+val+'"');}}else {buf.push(exports.attr(key,val,false,terse));}}}return buf.join('');}; /**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */var jade_encode_html_rules={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'};var jade_match_html=/[&<>"]/g;function jade_encode_char(c){return jade_encode_html_rules[c]||c;}exports.escape=jade_escape;function jade_escape(html){var result=String(html).replace(jade_match_html,jade_encode_char);if(result===''+html)return html;else return result;}; /**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */exports.rethrow=function rethrow(err,filename,lineno,str){if(!(err instanceof Error))throw err;if((typeof window!='undefined'||!filename)&&!str){err.message+=' on line '+lineno;throw err;}try{str=str||require('fs').readFileSync(filename,'utf8');}catch(ex){rethrow(err,null,lineno);}var context=3,lines=str.split('\n'),start=Math.max(lineno-context,0),end=Math.min(lines.length,lineno+context); // Error context
var context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return (curr==lineno?'  > ':'    ')+curr+'| '+line;}).join('\n'); // Alter exception message
err.path=filename;err.message=(filename||'Jade')+':'+lineno+'\n'+context+'\n\n'+err.message;throw err;};exports.DebugItem=function DebugItem(lineno,filename){this.lineno=lineno;this.filename=filename;};},{"fs":4}],37:[function(require,module,exports){'use strict'; /**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */exports.merge=function(a,b){for(var key in b){a[key]=b[key];}return a;};exports.stringify=function(str){return JSON.stringify(str).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");};exports.walkAST=function walkAST(ast,before,after){before&&before(ast);switch(ast.type){case 'Block':ast.nodes.forEach(function(node){walkAST(node,before,after);});break;case 'Case':case 'Each':case 'Mixin':case 'Tag':case 'When':case 'Code':ast.block&&walkAST(ast.block,before,after);break;case 'Attrs':case 'BlockComment':case 'Comment':case 'Doctype':case 'Filter':case 'Literal':case 'MixinBlock':case 'Text':break;default:throw new Error('Unexpected node type '+ast.type);break;}after&&after(ast);};},{}],38:[function(require,module,exports){ /**
The following batches are equivalent:

var beautify_js = require('js-beautify');
var beautify_js = require('js-beautify').js;
var beautify_js = require('js-beautify').js_beautify;

var beautify_css = require('js-beautify').css;
var beautify_css = require('js-beautify').css_beautify;

var beautify_html = require('js-beautify').html;
var beautify_html = require('js-beautify').html_beautify;

All methods returned accept two arguments, the source string and an options object.
**/function get_beautify(js_beautify,css_beautify,html_beautify){ // the default is js
var beautify=function beautify(src,config){return js_beautify.js_beautify(src,config);}; // short aliases
beautify.js=js_beautify.js_beautify;beautify.css=css_beautify.css_beautify;beautify.html=html_beautify.html_beautify; // legacy aliases
beautify.js_beautify=js_beautify.js_beautify;beautify.css_beautify=css_beautify.css_beautify;beautify.html_beautify=html_beautify.html_beautify;return beautify;}if(typeof define==="function"&&define.amd){ // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
define(["./lib/beautify","./lib/beautify-css","./lib/beautify-html"],function(js_beautify,css_beautify,html_beautify){return get_beautify(js_beautify,css_beautify,html_beautify);});}else {(function(mod){var js_beautify=require('./lib/beautify');var css_beautify=require('./lib/beautify-css');var html_beautify=require('./lib/beautify-html');mod.exports=get_beautify(js_beautify,css_beautify,html_beautify);})(module);}},{"./lib/beautify":41,"./lib/beautify-css":39,"./lib/beautify-html":40}],39:[function(require,module,exports){(function(global){ /*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */ /*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 CSS Beautifier
---------------

    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)

    Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
        http://jsbeautifier.org/

    Usage:
        css_beautify(source_text);
        css_beautify(source_text, options);

    The options are (default in brackets):
        indent_size (4)                   — indentation size,
        indent_char (space)               — character to indent with,
        selector_separator_newline (true) - separate selectors with newline or
                                            not (e.g. "a,\nbr" or "a, br")
        end_with_newline (false)          - end with a newline
        newline_between_rules (true)      - add a new line after every css rule

    e.g

    css_beautify(css_source_text, {
      'indent_size': 1,
      'indent_char': '\t',
      'selector_separator': ' ',
      'end_with_newline': false,
      'newline_between_rules': true
    });
*/ // http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/
(function(){function css_beautify(source_text,options){options=options||{};source_text=source_text||''; // HACK: newline parsing inconsistent. This brute force normalizes the input.
source_text=source_text.replace(/\r\n|[\r\u2028\u2029]/g,'\n');var indentSize=options.indent_size||4;var indentCharacter=options.indent_char||' ';var selectorSeparatorNewline=options.selector_separator_newline===undefined?true:options.selector_separator_newline;var end_with_newline=options.end_with_newline===undefined?false:options.end_with_newline;var newline_between_rules=options.newline_between_rules===undefined?true:options.newline_between_rules;var eol=options.eol?options.eol:'\n'; // compatibility
if(typeof indentSize==="string"){indentSize=parseInt(indentSize,10);}if(options.indent_with_tabs){indentCharacter='\t';indentSize=1;}eol=eol.replace(/\\r/,'\r').replace(/\\n/,'\n'); // tokenizer
var whiteRe=/^\s+$/;var wordRe=/[\w$\-_]/;var pos=-1,ch;var parenLevel=0;function next(){ch=source_text.charAt(++pos);return ch||'';}function peek(skipWhitespace){var result='';var prev_pos=pos;if(skipWhitespace){eatWhitespace();}result=source_text.charAt(pos+1)||'';pos=prev_pos-1;next();return result;}function eatString(endChars){var start=pos;while(next()){if(ch==="\\"){next();}else if(endChars.indexOf(ch)!==-1){break;}else if(ch==="\n"){break;}}return source_text.substring(start,pos+1);}function peekString(endChar){var prev_pos=pos;var str=eatString(endChar);pos=prev_pos-1;next();return str;}function eatWhitespace(){var result='';while(whiteRe.test(peek())){next();result+=ch;}return result;}function skipWhitespace(){var result='';if(ch&&whiteRe.test(ch)){result=ch;}while(whiteRe.test(next())){result+=ch;}return result;}function eatComment(singleLine){var start=pos;singleLine=peek()==="/";next();while(next()){if(!singleLine&&ch==="*"&&peek()==="/"){next();break;}else if(singleLine&&ch==="\n"){return source_text.substring(start,pos);}}return source_text.substring(start,pos)+ch;}function lookBack(str){return source_text.substring(pos-str.length,pos).toLowerCase()===str;} // Nested pseudo-class if we are insideRule
// and the next special character found opens
// a new block
function foundNestedPseudoClass(){var openParen=0;for(var i=pos+1;i<source_text.length;i++){var ch=source_text.charAt(i);if(ch==="{"){return true;}else if(ch==='('){ // pseudoclasses can contain ()
openParen+=1;}else if(ch===')'){if(openParen==0){return false;}openParen-=1;}else if(ch===";"||ch==="}"){return false;}}return false;} // printer
var basebaseIndentString=source_text.match(/^[\t ]*/)[0];var singleIndent=new Array(indentSize+1).join(indentCharacter);var indentLevel=0;var nestedLevel=0;function indent(){indentLevel++;basebaseIndentString+=singleIndent;}function outdent(){indentLevel--;basebaseIndentString=basebaseIndentString.slice(0,-indentSize);}var print={};print["{"]=function(ch){print.singleSpace();output.push(ch);print.newLine();};print["}"]=function(ch){print.newLine();output.push(ch);print.newLine();};print._lastCharWhitespace=function(){return whiteRe.test(output[output.length-1]);};print.newLine=function(keepWhitespace){if(output.length){if(!keepWhitespace&&output[output.length-1]!=='\n'){print.trim();}output.push('\n');if(basebaseIndentString){output.push(basebaseIndentString);}}};print.singleSpace=function(){if(output.length&&!print._lastCharWhitespace()){output.push(' ');}};print.preserveSingleSpace=function(){if(isAfterSpace){print.singleSpace();}};print.trim=function(){while(print._lastCharWhitespace()){output.pop();}};var output=[]; /*_____________________--------------------_____________________*/var insideRule=false;var insidePropertyValue=false;var enteringConditionalGroup=false;var top_ch='';var last_top_ch='';while(true){var whitespace=skipWhitespace();var isAfterSpace=whitespace!=='';var isAfterNewline=whitespace.indexOf('\n')!==-1;last_top_ch=top_ch;top_ch=ch;if(!ch){break;}else if(ch==='/'&&peek()==='*'){ /* css comment */var header=indentLevel===0;if(isAfterNewline||header){print.newLine();}output.push(eatComment());print.newLine();if(header){print.newLine(true);}}else if(ch==='/'&&peek()==='/'){ // single line comment
if(!isAfterNewline&&last_top_ch!=='{'){print.trim();}print.singleSpace();output.push(eatComment());print.newLine();}else if(ch==='@'){print.preserveSingleSpace();output.push(ch); // strip trailing space, if present, for hash property checks
var variableOrRule=peekString(": ,;{}()[]/='\"");if(variableOrRule.match(/[ :]$/)){ // we have a variable or pseudo-class, add it and insert one space before continuing
next();variableOrRule=eatString(": ").replace(/\s$/,'');output.push(variableOrRule);print.singleSpace();}variableOrRule=variableOrRule.replace(/\s$/,''); // might be a nesting at-rule
if(variableOrRule in css_beautify.NESTED_AT_RULE){nestedLevel+=1;if(variableOrRule in css_beautify.CONDITIONAL_GROUP_RULE){enteringConditionalGroup=true;}}}else if(ch==='#'&&peek()==='{'){print.preserveSingleSpace();output.push(eatString('}'));}else if(ch==='{'){if(peek(true)==='}'){eatWhitespace();next();print.singleSpace();output.push("{}");print.newLine();if(newline_between_rules&&indentLevel===0){print.newLine(true);}}else {indent();print["{"](ch); // when entering conditional groups, only rulesets are allowed
if(enteringConditionalGroup){enteringConditionalGroup=false;insideRule=indentLevel>nestedLevel;}else { // otherwise, declarations are also allowed
insideRule=indentLevel>=nestedLevel;}}}else if(ch==='}'){outdent();print["}"](ch);insideRule=false;insidePropertyValue=false;if(nestedLevel){nestedLevel--;}if(newline_between_rules&&indentLevel===0){print.newLine(true);}}else if(ch===":"){eatWhitespace();if((insideRule||enteringConditionalGroup)&&!(lookBack("&")||foundNestedPseudoClass())){ // 'property: value' delimiter
// which could be in a conditional group query
insidePropertyValue=true;output.push(':');print.singleSpace();}else { // sass/less parent reference don't use a space
// sass nested pseudo-class don't use a space
if(peek()===":"){ // pseudo-element
next();output.push("::");}else { // pseudo-class
output.push(':');}}}else if(ch==='"'||ch==='\''){print.preserveSingleSpace();output.push(eatString(ch));}else if(ch===';'){insidePropertyValue=false;output.push(ch);print.newLine();}else if(ch==='('){ // may be a url
if(lookBack("url")){output.push(ch);eatWhitespace();if(next()){if(ch!==')'&&ch!=='"'&&ch!=='\''){output.push(eatString(')'));}else {pos--;}}}else {parenLevel++;print.preserveSingleSpace();output.push(ch);eatWhitespace();}}else if(ch===')'){output.push(ch);parenLevel--;}else if(ch===','){output.push(ch);eatWhitespace();if(selectorSeparatorNewline&&!insidePropertyValue&&parenLevel<1){print.newLine();}else {print.singleSpace();}}else if(ch===']'){output.push(ch);}else if(ch==='['){print.preserveSingleSpace();output.push(ch);}else if(ch==='='){ // no whitespace before or after
eatWhitespace();ch='=';output.push(ch);}else {print.preserveSingleSpace();output.push(ch);}}var sweetCode='';if(basebaseIndentString){sweetCode+=basebaseIndentString;}sweetCode+=output.join('').replace(/[\r\n\t ]+$/,''); // establish end_with_newline
if(end_with_newline){sweetCode+='\n';}if(eol!='\n'){sweetCode=sweetCode.replace(/[\n]/g,eol);}return sweetCode;} // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
css_beautify.NESTED_AT_RULE={"@page":true,"@font-face":true,"@keyframes":true, // also in CONDITIONAL_GROUP_RULE below
"@media":true,"@supports":true,"@document":true};css_beautify.CONDITIONAL_GROUP_RULE={"@media":true,"@supports":true,"@document":true}; /*global define */if(typeof define==="function"&&define.amd){ // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
define([],function(){return {css_beautify:css_beautify};});}else if(typeof exports!=="undefined"){ // Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var html_beautify = require("beautify").html_beautify`.
exports.css_beautify=css_beautify;}else if(typeof window!=="undefined"){ // If we're running a web page and don't have either of the above, add our one global
window.css_beautify=css_beautify;}else if(typeof global!=="undefined"){ // If we don't even have window, try global.
global.css_beautify=css_beautify;}})();}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],40:[function(require,module,exports){(function(global){ /*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */ /*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
    http://jsbeautifier.org/

  Usage:
    style_html(html_source);

    style_html(html_source, options);

  The options are:
    indent_inner_html (default false)  — indent <head> and <body> sections,
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    wrap_line_length (default 250)            -  maximum amount of characters per line (0 = disable)
    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "none"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are.
    unformatted (defaults to inline tags) - list of tags, that shouldn't be reformatted
    indent_scripts (default normal)  - "keep"|"separate"|"normal"
    preserve_newlines (default true) - whether existing line breaks before elements should be preserved
                                        Only works before elements, not inside tags or for text.
    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk
    indent_handlebars (default false) - format and indent {{#foo}} and {{/foo}}
    end_with_newline (false)          - end with a newline
    extra_liners (default [head,body,/html]) -List of tags that should have an extra newline before them.

    e.g.

    style_html(html_source, {
      'indent_inner_html': false,
      'indent_size': 2,
      'indent_char': ' ',
      'wrap_line_length': 78,
      'brace_style': 'expand',
      'preserve_newlines': true,
      'max_preserve_newlines': 5,
      'indent_handlebars': false,
      'extra_liners': ['/html']
    });
*/(function(){function trim(s){return s.replace(/^\s+|\s+$/g,'');}function ltrim(s){return s.replace(/^\s+/g,'');}function rtrim(s){return s.replace(/\s+$/g,'');}function style_html(html_source,options,js_beautify,css_beautify){ //Wrapper function to invoke all the necessary constructors and deal with the output.
var multi_parser,indent_inner_html,indent_size,indent_character,wrap_line_length,brace_style,unformatted,preserve_newlines,max_preserve_newlines,indent_handlebars,wrap_attributes,wrap_attributes_indent_size,end_with_newline,extra_liners,eol;options=options||{}; // backwards compatibility to 1.3.4
if((options.wrap_line_length===undefined||parseInt(options.wrap_line_length,10)===0)&&options.max_char!==undefined&&parseInt(options.max_char,10)!==0){options.wrap_line_length=options.max_char;}indent_inner_html=options.indent_inner_html===undefined?false:options.indent_inner_html;indent_size=options.indent_size===undefined?4:parseInt(options.indent_size,10);indent_character=options.indent_char===undefined?' ':options.indent_char;brace_style=options.brace_style===undefined?'collapse':options.brace_style;wrap_line_length=parseInt(options.wrap_line_length,10)===0?32786:parseInt(options.wrap_line_length||250,10);unformatted=options.unformatted||[ // https://www.w3.org/TR/html5/dom.html#phrasing-content
'a','abbr','area','audio','b','bdi','bdo','br','button','canvas','cite','code','data','datalist','del','dfn','em','embed','i','iframe','img','input','ins','kbd','keygen','label','map','mark','math','meter','noscript','object','output','progress','q','ruby','s','samp', /* 'script', */'select','small','span','strong','sub','sup','svg','template','textarea','time','u','var','video','wbr','text', // prexisting - not sure of full effect of removing, leaving in
'acronym','address','big','dt','ins','small','strike','tt','pre','h1','h2','h3','h4','h5','h6'];preserve_newlines=options.preserve_newlines===undefined?true:options.preserve_newlines;max_preserve_newlines=preserve_newlines?isNaN(parseInt(options.max_preserve_newlines,10))?32786:parseInt(options.max_preserve_newlines,10):0;indent_handlebars=options.indent_handlebars===undefined?false:options.indent_handlebars;wrap_attributes=options.wrap_attributes===undefined?'auto':options.wrap_attributes;wrap_attributes_indent_size=isNaN(parseInt(options.wrap_attributes_indent_size,10))?indent_size:parseInt(options.wrap_attributes_indent_size,10);end_with_newline=options.end_with_newline===undefined?false:options.end_with_newline;extra_liners=_typeof(options.extra_liners)=='object'&&options.extra_liners?options.extra_liners.concat():typeof options.extra_liners==='string'?options.extra_liners.split(','):'head,body,/html'.split(',');eol=options.eol?options.eol:'\n';if(options.indent_with_tabs){indent_character='\t';indent_size=1;}eol=eol.replace(/\\r/,'\r').replace(/\\n/,'\n');function Parser(){this.pos=0; //Parser position
this.token='';this.current_mode='CONTENT'; //reflects the current Parser mode: TAG/CONTENT
this.tags={ //An object to hold tags, their position, and their parent-tags, initiated with default values
parent:'parent1',parentcount:1,parent1:''};this.tag_type='';this.token_text=this.last_token=this.last_text=this.token_type='';this.newlines=0;this.indent_content=indent_inner_html;this.Utils={ //Uilities made available to the various functions
whitespace:"\n\r\t ".split(''),single_token:[ // HTLM void elements - aka self-closing tags - aka singletons
// https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
'area','base','br','col','embed','hr','img','input','keygen','link','menuitem','meta','param','source','track','wbr', // NOTE: Optional tags - are not understood.
// https://www.w3.org/TR/html5/syntax.html#optional-tags
// The rules for optional tags are too complex for a simple list
// Also, the content of these tags should still be indented in many cases.
// 'li' is a good exmple.
// Doctype and xml elements
'!doctype','?xml', // ?php tag
'?php', // other tags that were in this list, keeping just in case
'basefont','isindex'],extra_liners:extra_liners, //for tags that need a line of whitespace before them
in_array:function in_array(what,arr){for(var i=0;i<arr.length;i++){if(what===arr[i]){return true;}}return false;}}; // Return true if the given text is composed entirely of whitespace.
this.is_whitespace=function(text){for(var n=0;n<text.length;n++){if(!this.Utils.in_array(text.charAt(n),this.Utils.whitespace)){return false;}}return true;};this.traverse_whitespace=function(){var input_char='';input_char=this.input.charAt(this.pos);if(this.Utils.in_array(input_char,this.Utils.whitespace)){this.newlines=0;while(this.Utils.in_array(input_char,this.Utils.whitespace)){if(preserve_newlines&&input_char==='\n'&&this.newlines<=max_preserve_newlines){this.newlines+=1;}this.pos++;input_char=this.input.charAt(this.pos);}return true;}return false;}; // Append a space to the given content (string array) or, if we are
// at the wrap_line_length, append a newline/indentation.
// return true if a newline was added, false if a space was added
this.space_or_wrap=function(content){if(this.line_char_count>=this.wrap_line_length){ //insert a line when the wrap_line_length is reached
this.print_newline(false,content);this.print_indentation(content);return true;}else {this.line_char_count++;content.push(' ');return false;}};this.get_content=function(){ //function to capture regular content between tags
var input_char='',content=[],space=false; //if a space is needed
while(this.input.charAt(this.pos)!=='<'){if(this.pos>=this.input.length){return content.length?content.join(''):['','TK_EOF'];}if(this.traverse_whitespace()){this.space_or_wrap(content);continue;}if(indent_handlebars){ // Handlebars parsing is complicated.
// {{#foo}} and {{/foo}} are formatted tags.
// {{something}} should get treated as content, except:
// {{else}} specifically behaves like {{#if}} and {{/if}}
var peek3=this.input.substr(this.pos,3);if(peek3==='{{#'||peek3==='{{/'){ // These are tags and not content.
break;}else if(peek3==='{{!'){return [this.get_tag(),'TK_TAG_HANDLEBARS_COMMENT'];}else if(this.input.substr(this.pos,2)==='{{'){if(this.get_tag(true)==='{{else}}'){break;}}}input_char=this.input.charAt(this.pos);this.pos++;this.line_char_count++;content.push(input_char); //letter at-a-time (or string) inserted to an array
}return content.length?content.join(''):'';};this.get_contents_to=function(name){ //get the full content of a script or style to pass to js_beautify
if(this.pos===this.input.length){return ['','TK_EOF'];}var input_char='';var content='';var reg_match=new RegExp('</'+name+'\\s*>','igm');reg_match.lastIndex=this.pos;var reg_array=reg_match.exec(this.input);var end_script=reg_array?reg_array.index:this.input.length; //absolute end of script
if(this.pos<end_script){ //get everything in between the script tags
content=this.input.substring(this.pos,end_script);this.pos=end_script;}return content;};this.record_tag=function(tag){ //function to record a tag and its parent in this.tags Object
if(this.tags[tag+'count']){ //check for the existence of this tag type
this.tags[tag+'count']++;this.tags[tag+this.tags[tag+'count']]=this.indent_level; //and record the present indent level
}else { //otherwise initialize this tag type
this.tags[tag+'count']=1;this.tags[tag+this.tags[tag+'count']]=this.indent_level; //and record the present indent level
}this.tags[tag+this.tags[tag+'count']+'parent']=this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
this.tags.parent=tag+this.tags[tag+'count']; //and make this the current parent (i.e. in the case of a div 'div1')
};this.retrieve_tag=function(tag){ //function to retrieve the opening tag to the corresponding closer
if(this.tags[tag+'count']){ //if the openener is not in the Object we ignore it
var temp_parent=this.tags.parent; //check to see if it's a closable tag.
while(temp_parent){ //till we reach '' (the initial value);
if(tag+this.tags[tag+'count']===temp_parent){ //if this is it use it
break;}temp_parent=this.tags[temp_parent+'parent']; //otherwise keep on climbing up the DOM Tree
}if(temp_parent){ //if we caught something
this.indent_level=this.tags[tag+this.tags[tag+'count']]; //set the indent_level accordingly
this.tags.parent=this.tags[temp_parent+'parent']; //and set the current parent
}delete this.tags[tag+this.tags[tag+'count']+'parent']; //delete the closed tags parent reference...
delete this.tags[tag+this.tags[tag+'count']]; //...and the tag itself
if(this.tags[tag+'count']===1){delete this.tags[tag+'count'];}else {this.tags[tag+'count']--;}}};this.indent_to_tag=function(tag){ // Match the indentation level to the last use of this tag, but don't remove it.
if(!this.tags[tag+'count']){return;}var temp_parent=this.tags.parent;while(temp_parent){if(tag+this.tags[tag+'count']===temp_parent){break;}temp_parent=this.tags[temp_parent+'parent'];}if(temp_parent){this.indent_level=this.tags[tag+this.tags[tag+'count']];}};this.get_tag=function(peek){ //function to get a full tag and parse its type
var input_char='',content=[],comment='',space=false,first_attr=true,tag_start,tag_end,tag_start_char,orig_pos=this.pos,orig_line_char_count=this.line_char_count;peek=peek!==undefined?peek:false;do {if(this.pos>=this.input.length){if(peek){this.pos=orig_pos;this.line_char_count=orig_line_char_count;}return content.length?content.join(''):['','TK_EOF'];}input_char=this.input.charAt(this.pos);this.pos++;if(this.Utils.in_array(input_char,this.Utils.whitespace)){ //don't want to insert unnecessary space
space=true;continue;}if(input_char==="'"||input_char==='"'){input_char+=this.get_unformatted(input_char);space=true;}if(input_char==='='){ //no space before =
space=false;}if(content.length&&content[content.length-1]!=='='&&input_char!=='>'&&space){ //no space after = or before >
var wrapped=this.space_or_wrap(content);var indentAttrs=wrapped&&input_char!=='/'&&wrap_attributes!=='force';space=false;if(!first_attr&&wrap_attributes==='force'&&input_char!=='/'){this.print_newline(false,content);this.print_indentation(content);indentAttrs=true;}if(indentAttrs){ //indent attributes an auto or forced line-wrap
for(var count=0;count<wrap_attributes_indent_size;count++){content.push(indent_character);}}for(var i=0;i<content.length;i++){if(content[i]===' '){first_attr=false;break;}}}if(indent_handlebars&&tag_start_char==='<'){ // When inside an angle-bracket tag, put spaces around
// handlebars not inside of strings.
if(input_char+this.input.charAt(this.pos)==='{{'){input_char+=this.get_unformatted('}}');if(content.length&&content[content.length-1]!==' '&&content[content.length-1]!=='<'){input_char=' '+input_char;}space=true;}}if(input_char==='<'&&!tag_start_char){tag_start=this.pos-1;tag_start_char='<';}if(indent_handlebars&&!tag_start_char){if(content.length>=2&&content[content.length-1]==='{'&&content[content.length-2]==='{'){if(input_char==='#'||input_char==='/'||input_char==='!'){tag_start=this.pos-3;}else {tag_start=this.pos-2;}tag_start_char='{';}}this.line_char_count++;content.push(input_char); //inserts character at-a-time (or string)
if(content[1]&&(content[1]==='!'||content[1]==='?'||content[1]==='%')){ //if we're in a comment, do something special
// We treat all comments as literals, even more than preformatted tags
// we just look for the appropriate close tag
content=[this.get_comment(tag_start)];break;}if(indent_handlebars&&content[1]&&content[1]==='{'&&content[2]&&content[2]==='!'){ //if we're in a comment, do something special
// We treat all comments as literals, even more than preformatted tags
// we just look for the appropriate close tag
content=[this.get_comment(tag_start)];break;}if(indent_handlebars&&tag_start_char==='{'&&content.length>2&&content[content.length-2]==='}'&&content[content.length-1]==='}'){break;}}while(input_char!=='>');var tag_complete=content.join('');var tag_index;var tag_offset;if(tag_complete.indexOf(' ')!==-1){ //if there's whitespace, thats where the tag name ends
tag_index=tag_complete.indexOf(' ');}else if(tag_complete.charAt(0)==='{'){tag_index=tag_complete.indexOf('}');}else { //otherwise go with the tag ending
tag_index=tag_complete.indexOf('>');}if(tag_complete.charAt(0)==='<'||!indent_handlebars){tag_offset=1;}else {tag_offset=tag_complete.charAt(2)==='#'?3:2;}var tag_check=tag_complete.substring(tag_offset,tag_index).toLowerCase();if(tag_complete.charAt(tag_complete.length-2)==='/'||this.Utils.in_array(tag_check,this.Utils.single_token)){ //if this tag name is a single tag type (either in the list or has a closing /)
if(!peek){this.tag_type='SINGLE';}}else if(indent_handlebars&&tag_complete.charAt(0)==='{'&&tag_check==='else'){if(!peek){this.indent_to_tag('if');this.tag_type='HANDLEBARS_ELSE';this.indent_content=true;this.traverse_whitespace();}}else if(this.is_unformatted(tag_check,unformatted)){ // do not reformat the "unformatted" tags
comment=this.get_unformatted('</'+tag_check+'>',tag_complete); //...delegate to get_unformatted function
content.push(comment);tag_end=this.pos-1;this.tag_type='SINGLE';}else if(tag_check==='script'&&(tag_complete.search('type')===-1||tag_complete.search('type')>-1&&tag_complete.search(/\b(text|application)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json)/)>-1)){if(!peek){this.record_tag(tag_check);this.tag_type='SCRIPT';}}else if(tag_check==='style'&&(tag_complete.search('type')===-1||tag_complete.search('type')>-1&&tag_complete.search('text/css')>-1)){if(!peek){this.record_tag(tag_check);this.tag_type='STYLE';}}else if(tag_check.charAt(0)==='!'){ //peek for <! comment
// for comments content is already correct.
if(!peek){this.tag_type='SINGLE';this.traverse_whitespace();}}else if(!peek){if(tag_check.charAt(0)==='/'){ //this tag is a double tag so check for tag-ending
this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
this.tag_type='END';}else { //otherwise it's a start-tag
this.record_tag(tag_check); //push it on the tag stack
if(tag_check.toLowerCase()!=='html'){this.indent_content=true;}this.tag_type='START';} // Allow preserving of newlines after a start or end tag
if(this.traverse_whitespace()){this.space_or_wrap(content);}if(this.Utils.in_array(tag_check,this.Utils.extra_liners)){ //check if this double needs an extra line
this.print_newline(false,this.output);if(this.output.length&&this.output[this.output.length-2]!=='\n'){this.print_newline(true,this.output);}}}if(peek){this.pos=orig_pos;this.line_char_count=orig_line_char_count;}return content.join(''); //returns fully formatted tag
};this.get_comment=function(start_pos){ //function to return comment content in its entirety
// this is will have very poor perf, but will work for now.
var comment='',delimiter='>',matched=false;this.pos=start_pos;var input_char=this.input.charAt(this.pos);this.pos++;while(this.pos<=this.input.length){comment+=input_char; // only need to check for the delimiter if the last chars match
if(comment.charAt(comment.length-1)===delimiter.charAt(delimiter.length-1)&&comment.indexOf(delimiter)!==-1){break;} // only need to search for custom delimiter for the first few characters
if(!matched&&comment.length<10){if(comment.indexOf('<![if')===0){ //peek for <![if conditional comment
delimiter='<![endif]>';matched=true;}else if(comment.indexOf('<![cdata[')===0){ //if it's a <[cdata[ comment...
delimiter=']]>';matched=true;}else if(comment.indexOf('<![')===0){ // some other ![ comment? ...
delimiter=']>';matched=true;}else if(comment.indexOf('<!--')===0){ // <!-- comment ...
delimiter='-->';matched=true;}else if(comment.indexOf('{{!')===0){ // {{! handlebars comment
delimiter='}}';matched=true;}else if(comment.indexOf('<?')===0){ // {{! handlebars comment
delimiter='?>';matched=true;}else if(comment.indexOf('<%')===0){ // {{! handlebars comment
delimiter='%>';matched=true;}}input_char=this.input.charAt(this.pos);this.pos++;}return comment;};function tokenMatcher(delimiter){var token='';var add=function add(str){var newToken=token+str.toLowerCase();token=newToken.length<=delimiter.length?newToken:newToken.substr(newToken.length-delimiter.length,delimiter.length);};var doesNotMatch=function doesNotMatch(){return token.indexOf(delimiter)===-1;};return {add:add,doesNotMatch:doesNotMatch};}this.get_unformatted=function(delimiter,orig_tag){ //function to return unformatted content in its entirety
if(orig_tag&&orig_tag.toLowerCase().indexOf(delimiter)!==-1){return '';}var input_char='';var content='';var space=true;var delimiterMatcher=tokenMatcher(delimiter);do {if(this.pos>=this.input.length){return content;}input_char=this.input.charAt(this.pos);this.pos++;if(this.Utils.in_array(input_char,this.Utils.whitespace)){if(!space){this.line_char_count--;continue;}if(input_char==='\n'||input_char==='\r'){content+='\n'; /*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
                for (var i=0; i<this.indent_level; i++) {
                  content += this.indent_string;
                }
                space = false; //...and make sure other indentation is erased
                */this.line_char_count=0;continue;}}content+=input_char;delimiterMatcher.add(input_char);this.line_char_count++;space=true;if(indent_handlebars&&input_char==='{'&&content.length&&content.charAt(content.length-2)==='{'){ // Handlebars expressions in strings should also be unformatted.
content+=this.get_unformatted('}}'); // Don't consider when stopping for delimiters.
}}while(delimiterMatcher.doesNotMatch());return content;};this.get_token=function(){ //initial handler for token-retrieval
var token;if(this.last_token==='TK_TAG_SCRIPT'||this.last_token==='TK_TAG_STYLE'){ //check if we need to format javascript
var type=this.last_token.substr(7);token=this.get_contents_to(type);if(typeof token!=='string'){return token;}return [token,'TK_'+type];}if(this.current_mode==='CONTENT'){token=this.get_content();if(typeof token!=='string'){return token;}else {return [token,'TK_CONTENT'];}}if(this.current_mode==='TAG'){token=this.get_tag();if(typeof token!=='string'){return token;}else {var tag_name_type='TK_TAG_'+this.tag_type;return [token,tag_name_type];}}};this.get_full_indent=function(level){level=this.indent_level+level||0;if(level<1){return '';}return Array(level+1).join(this.indent_string);};this.is_unformatted=function(tag_check,unformatted){ //is this an HTML5 block-level link?
if(!this.Utils.in_array(tag_check,unformatted)){return false;}if(tag_check.toLowerCase()!=='a'||!this.Utils.in_array('a',unformatted)){return true;} //at this point we have an  tag; is its first child something we want to remain
//unformatted?
var next_tag=this.get_tag(true /* peek. */); // test next_tag to see if it is just html tag (no external content)
var tag=(next_tag||"").match(/^\s*<\s*\/?([a-z]*)\s*[^>]*>\s*$/); // if next_tag comes back but is not an isolated tag, then
// let's treat the 'a' tag as having content
// and respect the unformatted option
if(!tag||this.Utils.in_array(tag,unformatted)){return true;}else {return false;}};this.printer=function(js_source,indent_character,indent_size,wrap_line_length,brace_style){ //handles input/output and some other printing functions
this.input=js_source||''; //gets the input for the Parser
// HACK: newline parsing inconsistent. This brute force normalizes the input.
this.input=this.input.replace(/\r\n|[\r\u2028\u2029]/g,'\n');this.output=[];this.indent_character=indent_character;this.indent_string='';this.indent_size=indent_size;this.brace_style=brace_style;this.indent_level=0;this.wrap_line_length=wrap_line_length;this.line_char_count=0; //count to see if wrap_line_length was exceeded
for(var i=0;i<this.indent_size;i++){this.indent_string+=this.indent_character;}this.print_newline=function(force,arr){this.line_char_count=0;if(!arr||!arr.length){return;}if(force||arr[arr.length-1]!=='\n'){ //we might want the extra line
if(arr[arr.length-1]!=='\n'){arr[arr.length-1]=rtrim(arr[arr.length-1]);}arr.push('\n');}};this.print_indentation=function(arr){for(var i=0;i<this.indent_level;i++){arr.push(this.indent_string);this.line_char_count+=this.indent_string.length;}};this.print_token=function(text){ // Avoid printing initial whitespace.
if(this.is_whitespace(text)&&!this.output.length){return;}if(text||text!==''){if(this.output.length&&this.output[this.output.length-1]==='\n'){this.print_indentation(this.output);text=ltrim(text);}}this.print_token_raw(text);};this.print_token_raw=function(text){ // If we are going to print newlines, truncate trailing
// whitespace, as the newlines will represent the space.
if(this.newlines>0){text=rtrim(text);}if(text&&text!==''){if(text.length>1&&text.charAt(text.length-1)==='\n'){ // unformatted tags can grab newlines as their last character
this.output.push(text.slice(0,-1));this.print_newline(false,this.output);}else {this.output.push(text);}}for(var n=0;n<this.newlines;n++){this.print_newline(n>0,this.output);}this.newlines=0;};this.indent=function(){this.indent_level++;};this.unindent=function(){if(this.indent_level>0){this.indent_level--;}};};return this;} /*_____________________--------------------_____________________*/multi_parser=new Parser(); //wrapping functions Parser
multi_parser.printer(html_source,indent_character,indent_size,wrap_line_length,brace_style); //initialize starting values
while(true){var t=multi_parser.get_token();multi_parser.token_text=t[0];multi_parser.token_type=t[1];if(multi_parser.token_type==='TK_EOF'){break;}switch(multi_parser.token_type){case 'TK_TAG_START':multi_parser.print_newline(false,multi_parser.output);multi_parser.print_token(multi_parser.token_text);if(multi_parser.indent_content){multi_parser.indent();multi_parser.indent_content=false;}multi_parser.current_mode='CONTENT';break;case 'TK_TAG_STYLE':case 'TK_TAG_SCRIPT':multi_parser.print_newline(false,multi_parser.output);multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='CONTENT';break;case 'TK_TAG_END': //Print new line only if the tag has no content and has child
if(multi_parser.last_token==='TK_CONTENT'&&multi_parser.last_text===''){var tag_name=multi_parser.token_text.match(/\w+/)[0];var tag_extracted_from_last_output=null;if(multi_parser.output.length){tag_extracted_from_last_output=multi_parser.output[multi_parser.output.length-1].match(/(?:<|{{#)\s*(\w+)/);}if(tag_extracted_from_last_output===null||tag_extracted_from_last_output[1]!==tag_name&&!multi_parser.Utils.in_array(tag_extracted_from_last_output[1],unformatted)){multi_parser.print_newline(false,multi_parser.output);}}multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='CONTENT';break;case 'TK_TAG_SINGLE': // Don't add a newline before elements that should remain unformatted.
var tag_check=multi_parser.token_text.match(/^\s*<([a-z-]+)/i);if(!tag_check||!multi_parser.Utils.in_array(tag_check[1],unformatted)){multi_parser.print_newline(false,multi_parser.output);}multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='CONTENT';break;case 'TK_TAG_HANDLEBARS_ELSE': // Don't add a newline if opening {{#if}} tag is on the current line
var foundIfOnCurrentLine=false;for(var lastCheckedOutput=multi_parser.output.length-1;lastCheckedOutput>=0;lastCheckedOutput--){if(multi_parser.output[lastCheckedOutput]==='\n'){break;}else {if(multi_parser.output[lastCheckedOutput].match(/{{#if/)){foundIfOnCurrentLine=true;break;}}}if(!foundIfOnCurrentLine){multi_parser.print_newline(false,multi_parser.output);}multi_parser.print_token(multi_parser.token_text);if(multi_parser.indent_content){multi_parser.indent();multi_parser.indent_content=false;}multi_parser.current_mode='CONTENT';break;case 'TK_TAG_HANDLEBARS_COMMENT':multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='TAG';break;case 'TK_CONTENT':multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='TAG';break;case 'TK_STYLE':case 'TK_SCRIPT':if(multi_parser.token_text!==''){multi_parser.print_newline(false,multi_parser.output);var text=multi_parser.token_text,_beautifier,script_indent_level=1;if(multi_parser.token_type==='TK_SCRIPT'){_beautifier=typeof js_beautify==='function'&&js_beautify;}else if(multi_parser.token_type==='TK_STYLE'){_beautifier=typeof css_beautify==='function'&&css_beautify;}if(options.indent_scripts==="keep"){script_indent_level=0;}else if(options.indent_scripts==="separate"){script_indent_level=-multi_parser.indent_level;}var indentation=multi_parser.get_full_indent(script_indent_level);if(_beautifier){ // call the Beautifier if avaliable
var Child_options=function Child_options(){this.eol='\n';};Child_options.prototype=options;var child_options=new Child_options();text=_beautifier(text.replace(/^\s*/,indentation),child_options);}else { // simply indent the string otherwise
var white=text.match(/^\s*/)[0];var _level=white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length-1;var reindent=multi_parser.get_full_indent(script_indent_level-_level);text=text.replace(/^\s*/,indentation).replace(/\r\n|\r|\n/g,'\n'+reindent).replace(/\s+$/,'');}if(text){multi_parser.print_token_raw(text);multi_parser.print_newline(true,multi_parser.output);}}multi_parser.current_mode='TAG';break;default: // We should not be getting here but we don't want to drop input on the floor
// Just output the text and move on
if(multi_parser.token_text!==''){multi_parser.print_token(multi_parser.token_text);}break;}multi_parser.last_token=multi_parser.token_type;multi_parser.last_text=multi_parser.token_text;}var sweet_code=multi_parser.output.join('').replace(/[\r\n\t ]+$/,''); // establish end_with_newline
if(end_with_newline){sweet_code+='\n';}if(eol!='\n'){sweet_code=sweet_code.replace(/[\n]/g,eol);}return sweet_code;}if(typeof define==="function"&&define.amd){ // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
define(["require","./beautify","./beautify-css"],function(requireamd){var js_beautify=requireamd("./beautify");var css_beautify=requireamd("./beautify-css");return {html_beautify:function html_beautify(html_source,options){return style_html(html_source,options,js_beautify.js_beautify,css_beautify.css_beautify);}};});}else if(typeof exports!=="undefined"){ // Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var html_beautify = require("beautify").html_beautify`.
var js_beautify=require('./beautify.js');var css_beautify=require('./beautify-css.js');exports.html_beautify=function(html_source,options){return style_html(html_source,options,js_beautify.js_beautify,css_beautify.css_beautify);};}else if(typeof window!=="undefined"){ // If we're running a web page and don't have either of the above, add our one global
window.html_beautify=function(html_source,options){return style_html(html_source,options,window.js_beautify,window.css_beautify);};}else if(typeof global!=="undefined"){ // If we don't even have window, try global.
global.html_beautify=function(html_source,options){return style_html(html_source,options,global.js_beautify,global.css_beautify);};}})();}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"./beautify-css.js":39,"./beautify.js":41}],41:[function(require,module,exports){(function(global){ /*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */ /*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>
  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>
  Parsing improvements for brace-less statements by Liam Newman <bitwiseman@gmail.com>


  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4)          - indentation size,
    indent_char (default space)      - character to indent with,
    preserve_newlines (default true) - whether existing line breaks should be preserved,
    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,

    jslint_happy (default false) - if true, then jslint-stricter mode is enforced.

            jslint_happy        !jslint_happy
            ---------------------------------
            function ()         function()

            switch () {         switch() {
            case 1:               case 1:
              break;                break;
            }                   }

    space_after_anon_function (default false) - should the space before an anonymous function's parens be added, "function()" vs "function ()",
          NOTE: This option is overriden by jslint_happy (i.e. if jslint_happy is true, space_after_anon_function is true by design)

    brace_style (default "collapse") - "collapse-preserve-inline" | "collapse" | "expand" | "end-expand" | "none"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are.

    space_before_conditional (default true) - should the space before conditional statement be added, "if(true)" vs "if (true)",

    unescape_strings (default false) - should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"

    wrap_line_length (default unlimited) - lines should wrap at next opportunity after this number of characters.
          NOTE: This is not a hard limit. Lines will continue until a point where a newline would
                be preserved if it were present.

    end_with_newline (default false)  - end output with a newline


    e.g

    js_beautify(js_source_text, {
      'indent_size': 1,
      'indent_char': '\t'
    });

*/(function(){var acorn={};(function(exports){ // This section of code is taken from acorn.
//
// Acorn was written by Marijn Haverbeke and released under an MIT
// license. The Unicode regexps (for identifiers and whitespace) were
// taken from [Esprima](http://esprima.org) by Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
// ## Character categories
// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
var nonASCIIwhitespace=/[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;var nonASCIIidentifierStartChars="ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";var nonASCIIidentifierChars="̀-ͯ҃-֑҇-ׇֽֿׁׂׅׄؐ-ؚؠ-ىٲ-ۓۧ-ۨۻ-ۼܰ-݊ࠀ-ࠔࠛ-ࠣࠥ-ࠧࠩ-࠭ࡀ-ࡗࣤ-ࣾऀ-ःऺ-़ा-ॏ॑-ॗॢ-ॣ०-९ঁ-ঃ়া-ৄেৈৗয়-ৠਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢ-ૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୟ-ୠ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఁ-ఃె-ైొ-్ౕౖౢ-ౣ౦-౯ಂಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢ-ೣ೦-೯ംഃെ-ൈൗൢ-ൣ൦-൯ංඃ්ා-ුූෘ-ෟෲෳิ-ฺเ-ๅ๐-๙ິ-ູ່-ໍ໐-໙༘༙༠-༩༹༵༷ཁ-ཇཱ-྄྆-྇ྍ-ྗྙ-ྼ࿆က-ဩ၀-၉ၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟ᜎ-ᜐᜠ-ᜰᝀ-ᝐᝲᝳក-ឲ៝០-៩᠋-᠍᠐-᠙ᤠ-ᤫᤰ-᤻ᥑ-ᥭᦰ-ᧀᧈ-ᧉ᧐-᧙ᨀ-ᨕᨠ-ᩓ᩠-᩿᩼-᪉᪐-᪙ᭆ-ᭋ᭐-᭙᭫-᭳᮰-᮹᯦-᯳ᰀ-ᰢ᱀-᱉ᱛ-ᱽ᳐-᳒ᴀ-ᶾḁ-ἕ‌‍‿⁀⁔⃐-⃥⃜⃡-⃰ⶁ-ⶖⷠ-ⷿ〡-〨゙゚Ꙁ-ꙭꙴ-꙽ꚟ꛰-꛱ꟸ-ꠀ꠆ꠋꠣ-ꠧꢀ-ꢁꢴ-꣄꣐-꣙ꣳ-ꣷ꤀-꤉ꤦ-꤭ꤰ-ꥅꦀ-ꦃ꦳-꧀ꨀ-ꨧꩀ-ꩁꩌ-ꩍ꩐-꩙ꩻꫠ-ꫩꫲ-ꫳꯀ-ꯡ꯬꯭꯰-꯹ﬠ-ﬨ︀-️︠-︦︳︴﹍-﹏０-９＿";var nonASCIIidentifierStart=new RegExp("["+nonASCIIidentifierStartChars+"]");var nonASCIIidentifier=new RegExp("["+nonASCIIidentifierStartChars+nonASCIIidentifierChars+"]"); // Whether a single character denotes a newline.
var newline=exports.newline=/[\n\r\u2028\u2029]/; // Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.
// in javascript, these two differ
// in python they are the same, different methods are called on them
var lineBreak=exports.lineBreak=/\r\n|[\n\r\u2028\u2029]/;var allLineBreaks=exports.allLineBreaks=new RegExp(lineBreak.source,'g'); // Test whether a given character code starts an identifier.
var isIdentifierStart=exports.isIdentifierStart=function(code){ // permit $ (36) and @ (64). @ is used in ES7 decorators.
if(code<65)return code===36||code===64; // 65 through 91 are uppercase letters.
if(code<91)return true; // permit _ (95).
if(code<97)return code===95; // 97 through 123 are lowercase letters.
if(code<123)return true;return code>=0xaa&&nonASCIIidentifierStart.test(String.fromCharCode(code));}; // Test whether a given character is part of an identifier.
var isIdentifierChar=exports.isIdentifierChar=function(code){if(code<48)return code===36;if(code<58)return true;if(code<65)return false;if(code<91)return true;if(code<97)return code===95;if(code<123)return true;return code>=0xaa&&nonASCIIidentifier.test(String.fromCharCode(code));};})(acorn);function in_array(what,arr){for(var i=0;i<arr.length;i+=1){if(arr[i]===what){return true;}}return false;}function trim(s){return s.replace(/^\s+|\s+$/g,'');}function ltrim(s){return s.replace(/^\s+/g,'');}function rtrim(s){return s.replace(/\s+$/g,'');}function js_beautify(js_source_text,options){"use strict";var beautifier=new Beautifier(js_source_text,options);return beautifier.beautify();}var MODE={BlockStatement:'BlockStatement', // 'BLOCK'
Statement:'Statement', // 'STATEMENT'
ObjectLiteral:'ObjectLiteral', // 'OBJECT',
ArrayLiteral:'ArrayLiteral', //'[EXPRESSION]',
ForInitializer:'ForInitializer', //'(FOR-EXPRESSION)',
Conditional:'Conditional', //'(COND-EXPRESSION)',
Expression:'Expression' //'(EXPRESSION)'
};function Beautifier(js_source_text,options){"use strict";var output;var tokens=[],token_pos;var Tokenizer;var current_token;var last_type,last_last_text,indent_string;var flags,previous_flags,flag_store;var prefix;var handlers,opt;var baseIndentString='';handlers={'TK_START_EXPR':handle_start_expr,'TK_END_EXPR':handle_end_expr,'TK_START_BLOCK':handle_start_block,'TK_END_BLOCK':handle_end_block,'TK_WORD':handle_word,'TK_RESERVED':handle_word,'TK_SEMICOLON':handle_semicolon,'TK_STRING':handle_string,'TK_EQUALS':handle_equals,'TK_OPERATOR':handle_operator,'TK_COMMA':handle_comma,'TK_BLOCK_COMMENT':handle_block_comment,'TK_COMMENT':handle_comment,'TK_DOT':handle_dot,'TK_UNKNOWN':handle_unknown,'TK_EOF':handle_eof};function create_flags(flags_base,mode){var next_indent_level=0;if(flags_base){next_indent_level=flags_base.indentation_level;if(!output.just_added_newline()&&flags_base.line_indent_level>next_indent_level){next_indent_level=flags_base.line_indent_level;}}var next_flags={mode:mode,parent:flags_base,last_text:flags_base?flags_base.last_text:'', // last token text
last_word:flags_base?flags_base.last_word:'', // last 'TK_WORD' passed
declaration_statement:false,declaration_assignment:false,multiline_frame:false,inline_frame:false,if_block:false,else_block:false,do_block:false,do_while:false,import_block:false,in_case_statement:false, // switch(..){ INSIDE HERE }
in_case:false, // we're on the exact line with "case 0:"
case_body:false, // the indented case-action block
indentation_level:next_indent_level,line_indent_level:flags_base?flags_base.line_indent_level:next_indent_level,start_line_index:output.get_line_number(),ternary_depth:0};return next_flags;} // Some interpreters have unexpected results with foo = baz || bar;
options=options?options:{};opt={}; // compatibility
if(options.braces_on_own_line!==undefined){ //graceful handling of deprecated option
opt.brace_style=options.braces_on_own_line?"expand":"collapse";}opt.brace_style=options.brace_style?options.brace_style:opt.brace_style?opt.brace_style:"collapse"; // graceful handling of deprecated option
if(opt.brace_style==="expand-strict"){opt.brace_style="expand";}opt.indent_size=options.indent_size?parseInt(options.indent_size,10):4;opt.indent_char=options.indent_char?options.indent_char:' ';opt.eol=options.eol?options.eol:'auto';opt.preserve_newlines=options.preserve_newlines===undefined?true:options.preserve_newlines;opt.break_chained_methods=options.break_chained_methods===undefined?false:options.break_chained_methods;opt.max_preserve_newlines=options.max_preserve_newlines===undefined?0:parseInt(options.max_preserve_newlines,10);opt.space_in_paren=options.space_in_paren===undefined?false:options.space_in_paren;opt.space_in_empty_paren=options.space_in_empty_paren===undefined?false:options.space_in_empty_paren;opt.jslint_happy=options.jslint_happy===undefined?false:options.jslint_happy;opt.space_after_anon_function=options.space_after_anon_function===undefined?false:options.space_after_anon_function;opt.keep_array_indentation=options.keep_array_indentation===undefined?false:options.keep_array_indentation;opt.space_before_conditional=options.space_before_conditional===undefined?true:options.space_before_conditional;opt.unescape_strings=options.unescape_strings===undefined?false:options.unescape_strings;opt.wrap_line_length=options.wrap_line_length===undefined?0:parseInt(options.wrap_line_length,10);opt.e4x=options.e4x===undefined?false:options.e4x;opt.end_with_newline=options.end_with_newline===undefined?false:options.end_with_newline;opt.comma_first=options.comma_first===undefined?false:options.comma_first; // For testing of beautify ignore:start directive
opt.test_output_raw=options.test_output_raw===undefined?false:options.test_output_raw; // force opt.space_after_anon_function to true if opt.jslint_happy
if(opt.jslint_happy){opt.space_after_anon_function=true;}if(options.indent_with_tabs){opt.indent_char='\t';opt.indent_size=1;}if(opt.eol==='auto'){opt.eol='\n';if(js_source_text&&acorn.lineBreak.test(js_source_text||'')){opt.eol=js_source_text.match(acorn.lineBreak)[0];}}opt.eol=opt.eol.replace(/\\r/,'\r').replace(/\\n/,'\n'); //----------------------------------
indent_string='';while(opt.indent_size>0){indent_string+=opt.indent_char;opt.indent_size-=1;}var preindent_index=0;if(js_source_text&&js_source_text.length){while(js_source_text.charAt(preindent_index)===' '||js_source_text.charAt(preindent_index)==='\t'){baseIndentString+=js_source_text.charAt(preindent_index);preindent_index+=1;}js_source_text=js_source_text.substring(preindent_index);}last_type='TK_START_BLOCK'; // last token type
last_last_text=''; // pre-last token text
output=new Output(indent_string,baseIndentString); // If testing the ignore directive, start with output disable set to true
output.raw=opt.test_output_raw; // Stack of parsing/formatting states, including MODE.
// We tokenize, parse, and output in an almost purely a forward-only stream of token input
// and formatted output.  This makes the beautifier less accurate than full parsers
// but also far more tolerant of syntax errors.
//
// For example, the default mode is MODE.BlockStatement. If we see a '{' we push a new frame of type
// MODE.BlockStatement on the the stack, even though it could be object literal.  If we later
// encounter a ":", we'll switch to to MODE.ObjectLiteral.  If we then see a ";",
// most full parsers would die, but the beautifier gracefully falls back to
// MODE.BlockStatement and continues on.
flag_store=[];set_mode(MODE.BlockStatement);this.beautify=function(){ /*jshint onevar:true */var local_token,sweet_code;Tokenizer=new tokenizer(js_source_text,opt,indent_string);tokens=Tokenizer.tokenize();token_pos=0;while(local_token=get_token()){for(var i=0;i<local_token.comments_before.length;i++){ // The cleanest handling of inline comments is to treat them as though they aren't there.
// Just continue formatting and the behavior should be logical.
// Also ignore unknown tokens.  Again, this should result in better behavior.
handle_token(local_token.comments_before[i]);}handle_token(local_token);last_last_text=flags.last_text;last_type=local_token.type;flags.last_text=local_token.text;token_pos+=1;}sweet_code=output.get_code();if(opt.end_with_newline){sweet_code+='\n';}if(opt.eol!='\n'){sweet_code=sweet_code.replace(/[\n]/g,opt.eol);}return sweet_code;};function handle_token(local_token){var newlines=local_token.newlines;var keep_whitespace=opt.keep_array_indentation&&is_array(flags.mode);if(keep_whitespace){for(i=0;i<newlines;i+=1){print_newline(i>0);}}else {if(opt.max_preserve_newlines&&newlines>opt.max_preserve_newlines){newlines=opt.max_preserve_newlines;}if(opt.preserve_newlines){if(local_token.newlines>1){print_newline();for(var i=1;i<newlines;i+=1){print_newline(true);}}}}current_token=local_token;handlers[current_token.type]();} // we could use just string.split, but
// IE doesn't like returning empty strings
function split_linebreaks(s){ //return s.split(/\x0d\x0a|\x0a/);
s=s.replace(acorn.allLineBreaks,'\n');var out=[],idx=s.indexOf("\n");while(idx!==-1){out.push(s.substring(0,idx));s=s.substring(idx+1);idx=s.indexOf("\n");}if(s.length){out.push(s);}return out;}var newline_restricted_tokens=['break','contiue','return','throw'];function allow_wrap_or_preserved_newline(force_linewrap){force_linewrap=force_linewrap===undefined?false:force_linewrap; // Never wrap the first token on a line
if(output.just_added_newline()){return;}if(opt.preserve_newlines&&current_token.wanted_newline||force_linewrap){print_newline(false,true);}else if(opt.wrap_line_length){if(last_type==='TK_RESERVED'&&in_array(flags.last_text,newline_restricted_tokens)){ // These tokens should never have a newline inserted
// between them and the following expression.
return;}var proposed_line_length=output.current_line.get_character_count()+current_token.text.length+(output.space_before_token?1:0);if(proposed_line_length>=opt.wrap_line_length){print_newline(false,true);}}}function print_newline(force_newline,preserve_statement_flags){if(!preserve_statement_flags){if(flags.last_text!==';'&&flags.last_text!==','&&flags.last_text!=='='&&last_type!=='TK_OPERATOR'){while(flags.mode===MODE.Statement&&!flags.if_block&&!flags.do_block){restore_mode();}}}if(output.add_new_line(force_newline)){flags.multiline_frame=true;}}function print_token_line_indentation(){if(output.just_added_newline()){if(opt.keep_array_indentation&&is_array(flags.mode)&&current_token.wanted_newline){output.current_line.push(current_token.whitespace_before);output.space_before_token=false;}else if(output.set_indent(flags.indentation_level)){flags.line_indent_level=flags.indentation_level;}}}function print_token(printable_token){if(output.raw){output.add_raw_token(current_token);return;}if(opt.comma_first&&last_type==='TK_COMMA'&&output.just_added_newline()){if(output.previous_line.last()===','){var popped=output.previous_line.pop(); // if the comma was already at the start of the line,
// pull back onto that line and reprint the indentation
if(output.previous_line.is_empty()){output.previous_line.push(popped);output.trim(true);output.current_line.pop();output.trim();} // add the comma in front of the next token
print_token_line_indentation();output.add_token(',');output.space_before_token=true;}}printable_token=printable_token||current_token.text;print_token_line_indentation();output.add_token(printable_token);}function indent(){flags.indentation_level+=1;}function deindent(){if(flags.indentation_level>0&&(!flags.parent||flags.indentation_level>flags.parent.indentation_level))flags.indentation_level-=1;}function set_mode(mode){if(flags){flag_store.push(flags);previous_flags=flags;}else {previous_flags=create_flags(null,mode);}flags=create_flags(previous_flags,mode);}function is_array(mode){return mode===MODE.ArrayLiteral;}function is_expression(mode){return in_array(mode,[MODE.Expression,MODE.ForInitializer,MODE.Conditional]);}function restore_mode(){if(flag_store.length>0){previous_flags=flags;flags=flag_store.pop();if(previous_flags.mode===MODE.Statement){output.remove_redundant_indentation(previous_flags);}}}function start_of_object_property(){return flags.parent.mode===MODE.ObjectLiteral&&flags.mode===MODE.Statement&&(flags.last_text===':'&&flags.ternary_depth===0||last_type==='TK_RESERVED'&&in_array(flags.last_text,['get','set']));}function start_of_statement(){if(last_type==='TK_RESERVED'&&in_array(flags.last_text,['var','let','const'])&&current_token.type==='TK_WORD'||last_type==='TK_RESERVED'&&flags.last_text==='do'||last_type==='TK_RESERVED'&&in_array(flags.last_text,['return','throw'])&&!current_token.wanted_newline||last_type==='TK_RESERVED'&&flags.last_text==='else'&&!(current_token.type==='TK_RESERVED'&&current_token.text==='if')||last_type==='TK_END_EXPR'&&(previous_flags.mode===MODE.ForInitializer||previous_flags.mode===MODE.Conditional)||last_type==='TK_WORD'&&flags.mode===MODE.BlockStatement&&!flags.in_case&&!(current_token.text==='--'||current_token.text==='++')&&last_last_text!=='function'&&current_token.type!=='TK_WORD'&&current_token.type!=='TK_RESERVED'||flags.mode===MODE.ObjectLiteral&&(flags.last_text===':'&&flags.ternary_depth===0||last_type==='TK_RESERVED'&&in_array(flags.last_text,['get','set']))){set_mode(MODE.Statement);indent();if(last_type==='TK_RESERVED'&&in_array(flags.last_text,['var','let','const'])&&current_token.type==='TK_WORD'){flags.declaration_statement=true;} // Issue #276:
// If starting a new statement with [if, for, while, do], push to a new line.
// if (a) if (b) if(c) d(); else e(); else f();
if(!start_of_object_property()){allow_wrap_or_preserved_newline(current_token.type==='TK_RESERVED'&&in_array(current_token.text,['do','for','if','while']));}return true;}return false;}function all_lines_start_with(lines,c){for(var i=0;i<lines.length;i++){var line=trim(lines[i]);if(line.charAt(0)!==c){return false;}}return true;}function each_line_matches_indent(lines,indent){var i=0,len=lines.length,line;for(;i<len;i++){line=lines[i]; // allow empty lines to pass through
if(line&&line.indexOf(indent)!==0){return false;}}return true;}function is_special_word(word){return in_array(word,['case','return','do','if','throw','else']);}function get_token(offset){var index=token_pos+(offset||0);return index<0||index>=tokens.length?null:tokens[index];}function handle_start_expr(){if(start_of_statement()){ // The conditional starts the statement if appropriate.
}var next_mode=MODE.Expression;if(current_token.text==='['){if(last_type==='TK_WORD'||flags.last_text===')'){ // this is array index specifier, break immediately
// a[x], fn()[x]
if(last_type==='TK_RESERVED'&&in_array(flags.last_text,Tokenizer.line_starters)){output.space_before_token=true;}set_mode(next_mode);print_token();indent();if(opt.space_in_paren){output.space_before_token=true;}return;}next_mode=MODE.ArrayLiteral;if(is_array(flags.mode)){if(flags.last_text==='['||flags.last_text===','&&(last_last_text===']'||last_last_text==='}')){ // ], [ goes to new line
// }, [ goes to new line
if(!opt.keep_array_indentation){print_newline();}}}}else {if(last_type==='TK_RESERVED'&&flags.last_text==='for'){next_mode=MODE.ForInitializer;}else if(last_type==='TK_RESERVED'&&in_array(flags.last_text,['if','while'])){next_mode=MODE.Conditional;}else { // next_mode = MODE.Expression;
}}if(flags.last_text===';'||last_type==='TK_START_BLOCK'){print_newline();}else if(last_type==='TK_END_EXPR'||last_type==='TK_START_EXPR'||last_type==='TK_END_BLOCK'||flags.last_text==='.'){ // TODO: Consider whether forcing this is required.  Review failing tests when removed.
allow_wrap_or_preserved_newline(current_token.wanted_newline); // do nothing on (( and )( and ][ and ]( and .(
}else if(!(last_type==='TK_RESERVED'&&current_token.text==='(')&&last_type!=='TK_WORD'&&last_type!=='TK_OPERATOR'){output.space_before_token=true;}else if(last_type==='TK_RESERVED'&&(flags.last_word==='function'||flags.last_word==='typeof')||flags.last_text==='*'&&last_last_text==='function'){ // function() vs function ()
if(opt.space_after_anon_function){output.space_before_token=true;}}else if(last_type==='TK_RESERVED'&&(in_array(flags.last_text,Tokenizer.line_starters)||flags.last_text==='catch')){if(opt.space_before_conditional){output.space_before_token=true;}} // Should be a space between await and an IIFE
if(current_token.text==='('&&last_type==='TK_RESERVED'&&flags.last_word==='await'){output.space_before_token=true;} // Support of this kind of newline preservation.
// a = (b &&
//     (c || d));
if(current_token.text==='('){if(last_type==='TK_EQUALS'||last_type==='TK_OPERATOR'){if(!start_of_object_property()){allow_wrap_or_preserved_newline();}}} // Support preserving wrapped arrow function expressions
// a.b('c',
//     () => d.e
// )
if(current_token.text==='('&&last_type!=='TK_WORD'&&last_type!=='TK_RESERVED'){allow_wrap_or_preserved_newline();}set_mode(next_mode);print_token();if(opt.space_in_paren){output.space_before_token=true;} // In all cases, if we newline while inside an expression it should be indented.
indent();}function handle_end_expr(){ // statements inside expressions are not valid syntax, but...
// statements must all be closed when their container closes
while(flags.mode===MODE.Statement){restore_mode();}if(flags.multiline_frame){allow_wrap_or_preserved_newline(current_token.text===']'&&is_array(flags.mode)&&!opt.keep_array_indentation);}if(opt.space_in_paren){if(last_type==='TK_START_EXPR'&&!opt.space_in_empty_paren){ // () [] no inner space in empty parens like these, ever, ref #320
output.trim();output.space_before_token=false;}else {output.space_before_token=true;}}if(current_token.text===']'&&opt.keep_array_indentation){print_token();restore_mode();}else {restore_mode();print_token();}output.remove_redundant_indentation(previous_flags); // do {} while () // no statement required after
if(flags.do_while&&previous_flags.mode===MODE.Conditional){previous_flags.mode=MODE.Expression;flags.do_block=false;flags.do_while=false;}}function handle_start_block(){ // Check if this is should be treated as a ObjectLiteral
var next_token=get_token(1);var second_token=get_token(2);if(second_token&&(in_array(second_token.text,[':',','])&&in_array(next_token.type,['TK_STRING','TK_WORD','TK_RESERVED'])||in_array(next_token.text,['get','set'])&&in_array(second_token.type,['TK_WORD','TK_RESERVED']))){ // We don't support TypeScript,but we didn't break it for a very long time.
// We'll try to keep not breaking it.
if(!in_array(last_last_text,['class','interface'])){set_mode(MODE.ObjectLiteral);}else {set_mode(MODE.BlockStatement);}}else if(last_type==='TK_OPERATOR'&&flags.last_text==='=>'){ // arrow function: (param1, paramN) => { statements }
set_mode(MODE.BlockStatement);}else if(in_array(last_type,['TK_EQUALS','TK_START_EXPR','TK_COMMA','TK_OPERATOR'])||last_type==='TK_RESERVED'&&in_array(flags.last_text,['return','throw','import'])){ // Detecting shorthand function syntax is difficult by scanning forward,
//     so check the surrounding context.
// If the block is being returned, imported, passed as arg,
//     assigned with = or assigned in a nested object, treat as an ObjectLiteral.
set_mode(MODE.ObjectLiteral);}else {set_mode(MODE.BlockStatement);}var empty_braces=!next_token.comments_before.length&&next_token.text==='}';var empty_anonymous_function=empty_braces&&flags.last_word==='function'&&last_type==='TK_END_EXPR';if(opt.brace_style==="expand"||opt.brace_style==="none"&&current_token.wanted_newline){if(last_type!=='TK_OPERATOR'&&(empty_anonymous_function||last_type==='TK_EQUALS'||last_type==='TK_RESERVED'&&is_special_word(flags.last_text)&&flags.last_text!=='else')){output.space_before_token=true;}else {print_newline(false,true);}}else { // collapse
if(opt.brace_style==='collapse-preserve-inline'){ // search forward for a newline wanted inside this block
var index=0;var check_token=null;flags.inline_frame=true;do {index+=1;check_token=get_token(index);if(check_token.wanted_newline){flags.inline_frame=false;break;}}while(check_token.type!=='TK_EOF'&&!(check_token.type==='TK_END_BLOCK'&&check_token.opened===current_token));}if(is_array(previous_flags.mode)&&(last_type==='TK_START_EXPR'||last_type==='TK_COMMA')){ // if we're preserving inline,
// allow newline between comma and next brace.
if(flags.inline_frame){allow_wrap_or_preserved_newline();flags.inline_frame=true;previous_flags.multiline_frame=previous_flags.multiline_frame||flags.multiline_frame;flags.multiline_frame=false;}else if(last_type==='TK_COMMA'){output.space_before_token=true;}}else if(last_type!=='TK_OPERATOR'&&last_type!=='TK_START_EXPR'){if(last_type==='TK_START_BLOCK'){print_newline();}else {output.space_before_token=true;}}}print_token();indent();}function handle_end_block(){ // statements must all be closed when their container closes
while(flags.mode===MODE.Statement){restore_mode();}var empty_braces=last_type==='TK_START_BLOCK';if(opt.brace_style==="expand"){if(!empty_braces){print_newline();}}else { // skip {}
if(!empty_braces){if(flags.inline_frame){output.space_before_token=true;}else if(is_array(flags.mode)&&opt.keep_array_indentation){ // we REALLY need a newline here, but newliner would skip that
opt.keep_array_indentation=false;print_newline();opt.keep_array_indentation=true;}else {print_newline();}}}restore_mode();print_token();}function handle_word(){if(current_token.type==='TK_RESERVED'){if(in_array(current_token.text,['set','get'])&&flags.mode!==MODE.ObjectLiteral){current_token.type='TK_WORD';}else if(in_array(current_token.text,['as','from'])&&!flags.import_block){current_token.type='TK_WORD';}else if(flags.mode===MODE.ObjectLiteral){var next_token=get_token(1);if(next_token.text==':'){current_token.type='TK_WORD';}}}if(start_of_statement()){ // The conditional starts the statement if appropriate.
}else if(current_token.wanted_newline&&!is_expression(flags.mode)&&(last_type!=='TK_OPERATOR'||flags.last_text==='--'||flags.last_text==='++')&&last_type!=='TK_EQUALS'&&(opt.preserve_newlines||!(last_type==='TK_RESERVED'&&in_array(flags.last_text,['var','let','const','set','get'])))){print_newline();}if(flags.do_block&&!flags.do_while){if(current_token.type==='TK_RESERVED'&&current_token.text==='while'){ // do {} ## while ()
output.space_before_token=true;print_token();output.space_before_token=true;flags.do_while=true;return;}else { // do {} should always have while as the next word.
// if we don't see the expected while, recover
print_newline();flags.do_block=false;}} // if may be followed by else, or not
// Bare/inline ifs are tricky
// Need to unwind the modes correctly: if (a) if (b) c(); else d(); else e();
if(flags.if_block){if(!flags.else_block&&current_token.type==='TK_RESERVED'&&current_token.text==='else'){flags.else_block=true;}else {while(flags.mode===MODE.Statement){restore_mode();}flags.if_block=false;flags.else_block=false;}}if(current_token.type==='TK_RESERVED'&&(current_token.text==='case'||current_token.text==='default'&&flags.in_case_statement)){print_newline();if(flags.case_body||opt.jslint_happy){ // switch cases following one another
deindent();flags.case_body=false;}print_token();flags.in_case=true;flags.in_case_statement=true;return;}if(current_token.type==='TK_RESERVED'&&current_token.text==='function'){if(in_array(flags.last_text,['}',';'])||output.just_added_newline()&&!in_array(flags.last_text,['[','{',':','=',','])){ // make sure there is a nice clean space of at least one blank line
// before a new function definition
if(!output.just_added_blankline()&&!current_token.comments_before.length){print_newline();print_newline(true);}}if(last_type==='TK_RESERVED'||last_type==='TK_WORD'){if(last_type==='TK_RESERVED'&&in_array(flags.last_text,['get','set','new','return','export','async'])){output.space_before_token=true;}else if(last_type==='TK_RESERVED'&&flags.last_text==='default'&&last_last_text==='export'){output.space_before_token=true;}else {print_newline();}}else if(last_type==='TK_OPERATOR'||flags.last_text==='='){ // foo = function
output.space_before_token=true;}else if(!flags.multiline_frame&&(is_expression(flags.mode)||is_array(flags.mode))){ // (function
}else {print_newline();}}if(last_type==='TK_COMMA'||last_type==='TK_START_EXPR'||last_type==='TK_EQUALS'||last_type==='TK_OPERATOR'){if(!start_of_object_property()){allow_wrap_or_preserved_newline();}}if(current_token.type==='TK_RESERVED'&&in_array(current_token.text,['function','get','set'])){print_token();flags.last_word=current_token.text;return;}prefix='NONE';if(last_type==='TK_END_BLOCK'){if(!(current_token.type==='TK_RESERVED'&&in_array(current_token.text,['else','catch','finally','from']))){prefix='NEWLINE';}else {if(opt.brace_style==="expand"||opt.brace_style==="end-expand"||opt.brace_style==="none"&&current_token.wanted_newline){prefix='NEWLINE';}else {prefix='SPACE';output.space_before_token=true;}}}else if(last_type==='TK_SEMICOLON'&&flags.mode===MODE.BlockStatement){ // TODO: Should this be for STATEMENT as well?
prefix='NEWLINE';}else if(last_type==='TK_SEMICOLON'&&is_expression(flags.mode)){prefix='SPACE';}else if(last_type==='TK_STRING'){prefix='NEWLINE';}else if(last_type==='TK_RESERVED'||last_type==='TK_WORD'||flags.last_text==='*'&&last_last_text==='function'){prefix='SPACE';}else if(last_type==='TK_START_BLOCK'){if(flags.inline_frame){prefix='SPACE';}else {prefix='NEWLINE';}}else if(last_type==='TK_END_EXPR'){output.space_before_token=true;prefix='NEWLINE';}if(current_token.type==='TK_RESERVED'&&in_array(current_token.text,Tokenizer.line_starters)&&flags.last_text!==')'){if(flags.last_text==='else'||flags.last_text==='export'){prefix='SPACE';}else {prefix='NEWLINE';}}if(current_token.type==='TK_RESERVED'&&in_array(current_token.text,['else','catch','finally'])){if(!(last_type==='TK_END_BLOCK'&&previous_flags.mode===MODE.BlockStatement)||opt.brace_style==="expand"||opt.brace_style==="end-expand"||opt.brace_style==="none"&&current_token.wanted_newline){print_newline();}else {output.trim(true);var line=output.current_line; // If we trimmed and there's something other than a close block before us
// put a newline back in.  Handles '} // comment' scenario.
if(line.last()!=='}'){print_newline();}output.space_before_token=true;}}else if(prefix==='NEWLINE'){if(last_type==='TK_RESERVED'&&is_special_word(flags.last_text)){ // no newline between 'return nnn'
output.space_before_token=true;}else if(last_type!=='TK_END_EXPR'){if((last_type!=='TK_START_EXPR'||!(current_token.type==='TK_RESERVED'&&in_array(current_token.text,['var','let','const'])))&&flags.last_text!==':'){ // no need to force newline on 'var': for (var x = 0...)
if(current_token.type==='TK_RESERVED'&&current_token.text==='if'&&flags.last_text==='else'){ // no newline for } else if {
output.space_before_token=true;}else {print_newline();}}}else if(current_token.type==='TK_RESERVED'&&in_array(current_token.text,Tokenizer.line_starters)&&flags.last_text!==')'){print_newline();}}else if(flags.multiline_frame&&is_array(flags.mode)&&flags.last_text===','&&last_last_text==='}'){print_newline(); // }, in lists get a newline treatment
}else if(prefix==='SPACE'){output.space_before_token=true;}print_token();flags.last_word=current_token.text;if(current_token.type==='TK_RESERVED'){if(current_token.text==='do'){flags.do_block=true;}else if(current_token.text==='if'){flags.if_block=true;}else if(current_token.text==='import'){flags.import_block=true;}else if(flags.import_block&&current_token.type==='TK_RESERVED'&&current_token.text==='from'){flags.import_block=false;}}}function handle_semicolon(){if(start_of_statement()){ // The conditional starts the statement if appropriate.
// Semicolon can be the start (and end) of a statement
output.space_before_token=false;}while(flags.mode===MODE.Statement&&!flags.if_block&&!flags.do_block){restore_mode();} // hacky but effective for the moment
if(flags.import_block){flags.import_block=false;}print_token();}function handle_string(){if(start_of_statement()){ // The conditional starts the statement if appropriate.
// One difference - strings want at least a space before
output.space_before_token=true;}else if(last_type==='TK_RESERVED'||last_type==='TK_WORD'||flags.inline_frame){output.space_before_token=true;}else if(last_type==='TK_COMMA'||last_type==='TK_START_EXPR'||last_type==='TK_EQUALS'||last_type==='TK_OPERATOR'){if(!start_of_object_property()){allow_wrap_or_preserved_newline();}}else {print_newline();}print_token();}function handle_equals(){if(start_of_statement()){ // The conditional starts the statement if appropriate.
}if(flags.declaration_statement){ // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
flags.declaration_assignment=true;}output.space_before_token=true;print_token();output.space_before_token=true;}function handle_comma(){print_token();output.space_before_token=true;if(flags.declaration_statement){if(is_expression(flags.parent.mode)){ // do not break on comma, for(var a = 1, b = 2)
flags.declaration_assignment=false;}if(flags.declaration_assignment){flags.declaration_assignment=false;print_newline(false,true);}else if(opt.comma_first){ // for comma-first, we want to allow a newline before the comma
// to turn into a newline after the comma, which we will fixup later
allow_wrap_or_preserved_newline();}}else if(flags.mode===MODE.ObjectLiteral||flags.mode===MODE.Statement&&flags.parent.mode===MODE.ObjectLiteral){if(flags.mode===MODE.Statement){restore_mode();}if(!flags.inline_frame){print_newline();}}else if(opt.comma_first){ // EXPR or DO_BLOCK
// for comma-first, we want to allow a newline before the comma
// to turn into a newline after the comma, which we will fixup later
allow_wrap_or_preserved_newline();}}function handle_operator(){if(start_of_statement()){ // The conditional starts the statement if appropriate.
}if(last_type==='TK_RESERVED'&&is_special_word(flags.last_text)){ // "return" had a special handling in TK_WORD. Now we need to return the favor
output.space_before_token=true;print_token();return;} // hack for actionscript's import .*;
if(current_token.text==='*'&&last_type==='TK_DOT'){print_token();return;}if(current_token.text===':'&&flags.in_case){flags.case_body=true;indent();print_token();print_newline();flags.in_case=false;return;}if(current_token.text==='::'){ // no spaces around exotic namespacing syntax operator
print_token();return;} // Allow line wrapping between operators
if(last_type==='TK_OPERATOR'){allow_wrap_or_preserved_newline();}var space_before=true;var space_after=true;if(in_array(current_token.text,['--','++','!','~'])||in_array(current_token.text,['-','+'])&&(in_array(last_type,['TK_START_BLOCK','TK_START_EXPR','TK_EQUALS','TK_OPERATOR'])||in_array(flags.last_text,Tokenizer.line_starters)||flags.last_text===',')){ // unary operators (and binary +/- pretending to be unary) special cases
space_before=false;space_after=false; // http://www.ecma-international.org/ecma-262/5.1/#sec-7.9.1
// if there is a newline between -- or ++ and anything else we should preserve it.
if(current_token.wanted_newline&&(current_token.text==='--'||current_token.text==='++')){print_newline(false,true);}if(flags.last_text===';'&&is_expression(flags.mode)){ // for (;; ++i)
//        ^^^
space_before=true;}if(last_type==='TK_RESERVED'){space_before=true;}else if(last_type==='TK_END_EXPR'){space_before=!(flags.last_text===']'&&(current_token.text==='--'||current_token.text==='++'));}else if(last_type==='TK_OPERATOR'){ // a++ + ++b;
// a - -b
space_before=in_array(current_token.text,['--','-','++','+'])&&in_array(flags.last_text,['--','-','++','+']); // + and - are not unary when preceeded by -- or ++ operator
// a-- + b
// a * +b
// a - -b
if(in_array(current_token.text,['+','-'])&&in_array(flags.last_text,['--','++'])){space_after=true;}}if((flags.mode===MODE.BlockStatement&&!flags.inline_frame||flags.mode===MODE.Statement)&&(flags.last_text==='{'||flags.last_text===';')){ // { foo; --i }
// foo(); --bar;
print_newline();}}else if(current_token.text===':'){if(flags.ternary_depth===0){ // Colon is invalid javascript outside of ternary and object, but do our best to guess what was meant.
space_before=false;}else {flags.ternary_depth-=1;}}else if(current_token.text==='?'){flags.ternary_depth+=1;}else if(current_token.text==='*'&&last_type==='TK_RESERVED'&&flags.last_text==='function'){space_before=false;space_after=false;}output.space_before_token=output.space_before_token||space_before;print_token();output.space_before_token=space_after;}function handle_block_comment(){if(output.raw){output.add_raw_token(current_token);if(current_token.directives&&current_token.directives['preserve']==='end'){ // If we're testing the raw output behavior, do not allow a directive to turn it off.
if(!opt.test_output_raw){output.raw=false;}}return;}if(current_token.directives){print_newline(false,true);print_token();if(current_token.directives['preserve']==='start'){output.raw=true;}print_newline(false,true);return;} // inline block
if(!acorn.newline.test(current_token.text)&&!current_token.wanted_newline){output.space_before_token=true;print_token();output.space_before_token=true;return;}var lines=split_linebreaks(current_token.text);var j; // iterator for this case
var javadoc=false;var starless=false;var lastIndent=current_token.whitespace_before;var lastIndentLength=lastIndent.length; // block comment starts with a new line
print_newline(false,true);if(lines.length>1){if(all_lines_start_with(lines.slice(1),'*')){javadoc=true;}else if(each_line_matches_indent(lines.slice(1),lastIndent)){starless=true;}} // first line always indented
print_token(lines[0]);for(j=1;j<lines.length;j++){print_newline(false,true);if(javadoc){ // javadoc: reformat and re-indent
print_token(' '+ltrim(lines[j]));}else if(starless&&lines[j].length>lastIndentLength){ // starless: re-indent non-empty content, avoiding trim
print_token(lines[j].substring(lastIndentLength));}else { // normal comments output raw
output.add_token(lines[j]);}} // for comments of more than one line, make sure there's a new line after
print_newline(false,true);}function handle_comment(){if(current_token.wanted_newline){print_newline(false,true);}else {output.trim(true);}output.space_before_token=true;print_token();print_newline(false,true);}function handle_dot(){if(start_of_statement()){ // The conditional starts the statement if appropriate.
}if(last_type==='TK_RESERVED'&&is_special_word(flags.last_text)){output.space_before_token=true;}else { // allow preserved newlines before dots in general
// force newlines on dots after close paren when break_chained - for bar().baz()
allow_wrap_or_preserved_newline(flags.last_text===')'&&opt.break_chained_methods);}print_token();}function handle_unknown(){print_token();if(current_token.text[current_token.text.length-1]==='\n'){print_newline();}}function handle_eof(){ // Unwind any open statements
while(flags.mode===MODE.Statement){restore_mode();}}}function OutputLine(parent){var _character_count=0; // use indent_count as a marker for lines that have preserved indentation
var _indent_count=-1;var _items=[];var _empty=true;this.set_indent=function(level){_character_count=parent.baseIndentLength+level*parent.indent_length;_indent_count=level;};this.get_character_count=function(){return _character_count;};this.is_empty=function(){return _empty;};this.last=function(){if(!this._empty){return _items[_items.length-1];}else {return null;}};this.push=function(input){_items.push(input);_character_count+=input.length;_empty=false;};this.pop=function(){var item=null;if(!_empty){item=_items.pop();_character_count-=item.length;_empty=_items.length===0;}return item;};this.remove_indent=function(){if(_indent_count>0){_indent_count-=1;_character_count-=parent.indent_length;}};this.trim=function(){while(this.last()===' '){var item=_items.pop();_character_count-=1;}_empty=_items.length===0;};this.toString=function(){var result='';if(!this._empty){if(_indent_count>=0){result=parent.indent_cache[_indent_count];}result+=_items.join('');}return result;};}function Output(indent_string,baseIndentString){baseIndentString=baseIndentString||'';this.indent_cache=[baseIndentString];this.baseIndentLength=baseIndentString.length;this.indent_length=indent_string.length;this.raw=false;var lines=[];this.baseIndentString=baseIndentString;this.indent_string=indent_string;this.previous_line=null;this.current_line=null;this.space_before_token=false;this.add_outputline=function(){this.previous_line=this.current_line;this.current_line=new OutputLine(this);lines.push(this.current_line);}; // initialize
this.add_outputline();this.get_line_number=function(){return lines.length;}; // Using object instead of string to allow for later expansion of info about each line
this.add_new_line=function(force_newline){if(this.get_line_number()===1&&this.just_added_newline()){return false; // no newline on start of file
}if(force_newline||!this.just_added_newline()){if(!this.raw){this.add_outputline();}return true;}return false;};this.get_code=function(){var sweet_code=lines.join('\n').replace(/[\r\n\t ]+$/,'');return sweet_code;};this.set_indent=function(level){ // Never indent your first output indent at the start of the file
if(lines.length>1){while(level>=this.indent_cache.length){this.indent_cache.push(this.indent_cache[this.indent_cache.length-1]+this.indent_string);}this.current_line.set_indent(level);return true;}this.current_line.set_indent(0);return false;};this.add_raw_token=function(token){for(var x=0;x<token.newlines;x++){this.add_outputline();}this.current_line.push(token.whitespace_before);this.current_line.push(token.text);this.space_before_token=false;};this.add_token=function(printable_token){this.add_space_before_token();this.current_line.push(printable_token);};this.add_space_before_token=function(){if(this.space_before_token&&!this.just_added_newline()){this.current_line.push(' ');}this.space_before_token=false;};this.remove_redundant_indentation=function(frame){ // This implementation is effective but has some issues:
//     - can cause line wrap to happen too soon due to indent removal
//           after wrap points are calculated
// These issues are minor compared to ugly indentation.
if(frame.multiline_frame||frame.mode===MODE.ForInitializer||frame.mode===MODE.Conditional){return;} // remove one indent from each line inside this section
var index=frame.start_line_index;var line;var output_length=lines.length;while(index<output_length){lines[index].remove_indent();index++;}};this.trim=function(eat_newlines){eat_newlines=eat_newlines===undefined?false:eat_newlines;this.current_line.trim(indent_string,baseIndentString);while(eat_newlines&&lines.length>1&&this.current_line.is_empty()){lines.pop();this.current_line=lines[lines.length-1];this.current_line.trim();}this.previous_line=lines.length>1?lines[lines.length-2]:null;};this.just_added_newline=function(){return this.current_line.is_empty();};this.just_added_blankline=function(){if(this.just_added_newline()){if(lines.length===1){return true; // start of the file and newline = blank
}var line=lines[lines.length-2];return line.is_empty();}return false;};}var Token=function Token(type,text,newlines,whitespace_before,mode,parent){this.type=type;this.text=text;this.comments_before=[];this.newlines=newlines||0;this.wanted_newline=newlines>0;this.whitespace_before=whitespace_before||'';this.parent=null;this.opened=null;this.directives=null;};function tokenizer(input,opts,indent_string){var whitespace="\n\r\t ".split('');var digit=/[0-9]/;var digit_bin=/[01]/;var digit_oct=/[01234567]/;var digit_hex=/[0123456789abcdefABCDEF]/;var punct='+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! ~ , : ? ^ ^= |= :: => **'.split(' '); // words which should always start on new line.
this.line_starters='continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');var reserved_words=this.line_starters.concat(['do','in','else','get','set','new','catch','finally','typeof','yield','async','await','from','as']); //  /* ... */ comment ends with nearest */ or end of file
var block_comment_pattern=/([\s\S]*?)((?:\*\/)|$)/g; // comment ends just before nearest linefeed or end of file
var comment_pattern=/([^\n\r\u2028\u2029]*)/g;var directives_block_pattern=/\/\* beautify( \w+[:]\w+)+ \*\//g;var directive_pattern=/ (\w+)[:](\w+)/g;var directives_end_ignore_pattern=/([\s\S]*?)((?:\/\*\sbeautify\signore:end\s\*\/)|$)/g;var template_pattern=/((<\?php|<\?=)[\s\S]*?\?>)|(<%[\s\S]*?%>)/g;var n_newlines,whitespace_before_token,in_html_comment,tokens,parser_pos;var input_length;this.tokenize=function(){ // cache the source's length.
input_length=input.length;parser_pos=0;in_html_comment=false;tokens=[];var next,last;var token_values;var open=null;var open_stack=[];var comments=[];while(!(last&&last.type==='TK_EOF')){token_values=tokenize_next();next=new Token(token_values[1],token_values[0],n_newlines,whitespace_before_token);while(next.type==='TK_COMMENT'||next.type==='TK_BLOCK_COMMENT'||next.type==='TK_UNKNOWN'){if(next.type==='TK_BLOCK_COMMENT'){next.directives=token_values[2];}comments.push(next);token_values=tokenize_next();next=new Token(token_values[1],token_values[0],n_newlines,whitespace_before_token);}if(comments.length){next.comments_before=comments;comments=[];}if(next.type==='TK_START_BLOCK'||next.type==='TK_START_EXPR'){next.parent=last;open_stack.push(open);open=next;}else if((next.type==='TK_END_BLOCK'||next.type==='TK_END_EXPR')&&open&&(next.text===']'&&open.text==='['||next.text===')'&&open.text==='('||next.text==='}'&&open.text==='{')){next.parent=open.parent;next.opened=open;open=open_stack.pop();}tokens.push(next);last=next;}return tokens;};function get_directives(text){if(!text.match(directives_block_pattern)){return null;}var directives={};directive_pattern.lastIndex=0;var directive_match=directive_pattern.exec(text);while(directive_match){directives[directive_match[1]]=directive_match[2];directive_match=directive_pattern.exec(text);}return directives;}function tokenize_next(){var i,resulting_string;var whitespace_on_this_line=[];n_newlines=0;whitespace_before_token='';if(parser_pos>=input_length){return ['','TK_EOF'];}var last_token;if(tokens.length){last_token=tokens[tokens.length-1];}else { // For the sake of tokenizing we can pretend that there was on open brace to start
last_token=new Token('TK_START_BLOCK','{');}var c=input.charAt(parser_pos);parser_pos+=1;while(in_array(c,whitespace)){if(acorn.newline.test(c)){if(!(c==='\n'&&input.charAt(parser_pos-2)==='\r')){n_newlines+=1;whitespace_on_this_line=[];}}else {whitespace_on_this_line.push(c);}if(parser_pos>=input_length){return ['','TK_EOF'];}c=input.charAt(parser_pos);parser_pos+=1;}if(whitespace_on_this_line.length){whitespace_before_token=whitespace_on_this_line.join('');}if(digit.test(c)||c==='.'&&digit.test(input.charAt(parser_pos))){var allow_decimal=true;var allow_e=true;var local_digit=digit;if(c==='0'&&parser_pos<input_length&&/[XxOoBb]/.test(input.charAt(parser_pos))){ // switch to hex/oct/bin number, no decimal or e, just hex/oct/bin digits
allow_decimal=false;allow_e=false;if(/[Bb]/.test(input.charAt(parser_pos))){local_digit=digit_bin;}else if(/[Oo]/.test(input.charAt(parser_pos))){local_digit=digit_oct;}else {local_digit=digit_hex;}c+=input.charAt(parser_pos);parser_pos+=1;}else if(c==='.'){ // Already have a decimal for this literal, don't allow another
allow_decimal=false;}else { // we know this first loop will run.  It keeps the logic simpler.
c='';parser_pos-=1;} // Add the digits
while(parser_pos<input_length&&local_digit.test(input.charAt(parser_pos))){c+=input.charAt(parser_pos);parser_pos+=1;if(allow_decimal&&parser_pos<input_length&&input.charAt(parser_pos)==='.'){c+=input.charAt(parser_pos);parser_pos+=1;allow_decimal=false;}else if(allow_e&&parser_pos<input_length&&/[Ee]/.test(input.charAt(parser_pos))){c+=input.charAt(parser_pos);parser_pos+=1;if(parser_pos<input_length&&/[+-]/.test(input.charAt(parser_pos))){c+=input.charAt(parser_pos);parser_pos+=1;}allow_e=false;allow_decimal=false;}}return [c,'TK_WORD'];}if(acorn.isIdentifierStart(input.charCodeAt(parser_pos-1))){if(parser_pos<input_length){while(acorn.isIdentifierChar(input.charCodeAt(parser_pos))){c+=input.charAt(parser_pos);parser_pos+=1;if(parser_pos===input_length){break;}}}if(!(last_token.type==='TK_DOT'||last_token.type==='TK_RESERVED'&&in_array(last_token.text,['set','get']))&&in_array(c,reserved_words)){if(c==='in'){ // hack for 'in' operator
return [c,'TK_OPERATOR'];}return [c,'TK_RESERVED'];}return [c,'TK_WORD'];}if(c==='('||c==='['){return [c,'TK_START_EXPR'];}if(c===')'||c===']'){return [c,'TK_END_EXPR'];}if(c==='{'){return [c,'TK_START_BLOCK'];}if(c==='}'){return [c,'TK_END_BLOCK'];}if(c===';'){return [c,'TK_SEMICOLON'];}if(c==='/'){var comment=''; // peek for comment /* ... */
if(input.charAt(parser_pos)==='*'){parser_pos+=1;block_comment_pattern.lastIndex=parser_pos;var comment_match=block_comment_pattern.exec(input);comment='/*'+comment_match[0];parser_pos+=comment_match[0].length;var directives=get_directives(comment);if(directives&&directives['ignore']==='start'){directives_end_ignore_pattern.lastIndex=parser_pos;comment_match=directives_end_ignore_pattern.exec(input);comment+=comment_match[0];parser_pos+=comment_match[0].length;}comment=comment.replace(acorn.allLineBreaks,'\n');return [comment,'TK_BLOCK_COMMENT',directives];} // peek for comment // ...
if(input.charAt(parser_pos)==='/'){parser_pos+=1;comment_pattern.lastIndex=parser_pos;var comment_match=comment_pattern.exec(input);comment='//'+comment_match[0];parser_pos+=comment_match[0].length;return [comment,'TK_COMMENT'];}}var startXmlRegExp=/^<([-a-zA-Z:0-9_.]+|{.+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{.+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{.+?}))*\s*(\/?)\s*>/;if(c==='`'||c==="'"||c==='"'|| // string
(c==='/'|| // regexp
opts.e4x&&c==="<"&&input.slice(parser_pos-1).match(startXmlRegExp) // xml
)&&( // regex and xml can only appear in specific locations during parsing
last_token.type==='TK_RESERVED'&&in_array(last_token.text,['return','case','throw','else','do','typeof','yield'])||last_token.type==='TK_END_EXPR'&&last_token.text===')'&&last_token.parent&&last_token.parent.type==='TK_RESERVED'&&in_array(last_token.parent.text,['if','while','for'])||in_array(last_token.type,['TK_COMMENT','TK_START_EXPR','TK_START_BLOCK','TK_END_BLOCK','TK_OPERATOR','TK_EQUALS','TK_EOF','TK_SEMICOLON','TK_COMMA']))){var sep=c,esc=false,has_char_escapes=false;resulting_string=c;if(sep==='/'){ //
// handle regexp
//
var in_char_class=false;while(parser_pos<input_length&&(esc||in_char_class||input.charAt(parser_pos)!==sep)&&!acorn.newline.test(input.charAt(parser_pos))){resulting_string+=input.charAt(parser_pos);if(!esc){esc=input.charAt(parser_pos)==='\\';if(input.charAt(parser_pos)==='['){in_char_class=true;}else if(input.charAt(parser_pos)===']'){in_char_class=false;}}else {esc=false;}parser_pos+=1;}}else if(opts.e4x&&sep==='<'){ //
// handle e4x xml literals
//
var xmlRegExp=/<(\/?)([-a-zA-Z:0-9_.]+|{.+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{.+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{.+?}))*\s*(\/?)\s*>/g;var xmlStr=input.slice(parser_pos-1);var match=xmlRegExp.exec(xmlStr);if(match&&match.index===0){var rootTag=match[2];var depth=0;while(match){var isEndTag=!!match[1];var tagName=match[2];var isSingletonTag=!!match[match.length-1]||tagName.slice(0,8)==="![CDATA[";if(tagName===rootTag&&!isSingletonTag){if(isEndTag){--depth;}else {++depth;}}if(depth<=0){break;}match=xmlRegExp.exec(xmlStr);}var xmlLength=match?match.index+match[0].length:xmlStr.length;xmlStr=xmlStr.slice(0,xmlLength);parser_pos+=xmlLength-1;xmlStr=xmlStr.replace(acorn.allLineBreaks,'\n');return [xmlStr,"TK_STRING"];}}else { //
// handle string
//
var parse_string=function parse_string(delimiter,allow_unescaped_newlines,start_sub){ // Template strings can travers lines without escape characters.
// Other strings cannot
var current_char;while(parser_pos<input_length){current_char=input.charAt(parser_pos);if(!(esc||current_char!==delimiter&&(allow_unescaped_newlines||!acorn.newline.test(current_char)))){break;} // Handle \r\n linebreaks after escapes or in template strings
if((esc||allow_unescaped_newlines)&&acorn.newline.test(current_char)){if(current_char==='\r'&&input.charAt(parser_pos+1)==='\n'){parser_pos+=1;current_char=input.charAt(parser_pos);}resulting_string+='\n';}else {resulting_string+=current_char;}if(esc){if(current_char==='x'||current_char==='u'){has_char_escapes=true;}esc=false;}else {esc=current_char==='\\';}parser_pos+=1;if(start_sub&&resulting_string.indexOf(start_sub,resulting_string.length-start_sub.length)!==-1){if(delimiter==='`'){parse_string('}',allow_unescaped_newlines,'`');}else {parse_string('`',allow_unescaped_newlines,'${');}}}};if(sep==='`'){parse_string('`',true,'${');}else {parse_string(sep);}}if(has_char_escapes&&opts.unescape_strings){resulting_string=unescape_string(resulting_string);}if(parser_pos<input_length&&input.charAt(parser_pos)===sep){resulting_string+=sep;parser_pos+=1;if(sep==='/'){ // regexps may have modifiers /regexp/MOD , so fetch those, too
// Only [gim] are valid, but if the user puts in garbage, do what we can to take it.
while(parser_pos<input_length&&acorn.isIdentifierStart(input.charCodeAt(parser_pos))){resulting_string+=input.charAt(parser_pos);parser_pos+=1;}}}return [resulting_string,'TK_STRING'];}if(c==='#'){if(tokens.length===0&&input.charAt(parser_pos)==='!'){ // shebang
resulting_string=c;while(parser_pos<input_length&&c!=='\n'){c=input.charAt(parser_pos);resulting_string+=c;parser_pos+=1;}return [trim(resulting_string)+'\n','TK_UNKNOWN'];} // Spidermonkey-specific sharp variables for circular references
// https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
// http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
var sharp='#';if(parser_pos<input_length&&digit.test(input.charAt(parser_pos))){do {c=input.charAt(parser_pos);sharp+=c;parser_pos+=1;}while(parser_pos<input_length&&c!=='#'&&c!=='=');if(c==='#'){ //
}else if(input.charAt(parser_pos)==='['&&input.charAt(parser_pos+1)===']'){sharp+='[]';parser_pos+=2;}else if(input.charAt(parser_pos)==='{'&&input.charAt(parser_pos+1)==='}'){sharp+='{}';parser_pos+=2;}return [sharp,'TK_WORD'];}}if(c==='<'&&(input.charAt(parser_pos)==='?'||input.charAt(parser_pos)==='%')){template_pattern.lastIndex=parser_pos-1;var template_match=template_pattern.exec(input);if(template_match){c=template_match[0];parser_pos+=c.length-1;c=c.replace(acorn.allLineBreaks,'\n');return [c,'TK_STRING'];}}if(c==='<'&&input.substring(parser_pos-1,parser_pos+3)==='<!--'){parser_pos+=3;c='<!--';while(!acorn.newline.test(input.charAt(parser_pos))&&parser_pos<input_length){c+=input.charAt(parser_pos);parser_pos++;}in_html_comment=true;return [c,'TK_COMMENT'];}if(c==='-'&&in_html_comment&&input.substring(parser_pos-1,parser_pos+2)==='-->'){in_html_comment=false;parser_pos+=2;return ['-->','TK_COMMENT'];}if(c==='.'){return [c,'TK_DOT'];}if(in_array(c,punct)){while(parser_pos<input_length&&in_array(c+input.charAt(parser_pos),punct)){c+=input.charAt(parser_pos);parser_pos+=1;if(parser_pos>=input_length){break;}}if(c===','){return [c,'TK_COMMA'];}else if(c==='='){return [c,'TK_EQUALS'];}else {return [c,'TK_OPERATOR'];}}return [c,'TK_UNKNOWN'];}function unescape_string(s){var esc=false,out='',pos=0,s_hex='',escaped=0,c;while(esc||pos<s.length){c=s.charAt(pos);pos++;if(esc){esc=false;if(c==='x'){ // simple hex-escape \x24
s_hex=s.substr(pos,2);pos+=2;}else if(c==='u'){ // unicode-escape, \u2134
s_hex=s.substr(pos,4);pos+=4;}else { // some common escape, e.g \n
out+='\\'+c;continue;}if(!s_hex.match(/^[0123456789abcdefABCDEF]+$/)){ // some weird escaping, bail out,
// leaving whole string intact
return s;}escaped=parseInt(s_hex,16);if(escaped>=0x00&&escaped<0x20){ // leave 0x00...0x1f escaped
if(c==='x'){out+='\\x'+s_hex;}else {out+="\\u"+s_hex;}continue;}else if(escaped===0x22||escaped===0x27||escaped===0x5c){ // single-quote, apostrophe, backslash - escape these
out+='\\'+String.fromCharCode(escaped);}else if(c==='x'&&escaped>0x7e&&escaped<=0xff){ // we bail out on \x7f..\xff,
// leaving whole string escaped,
// as it's probably completely binary
return s;}else {out+=String.fromCharCode(escaped);}}else if(c==='\\'){esc=true;}else {out+=c;}}return out;}}if(typeof define==="function"&&define.amd){ // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
define([],function(){return {js_beautify:js_beautify};});}else if(typeof exports!=="undefined"){ // Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var js_beautify = require("beautify").js_beautify`.
exports.js_beautify=js_beautify;}else if(typeof window!=="undefined"){ // If we're running a web page and don't have either of the above, add our one global
window.js_beautify=js_beautify;}else if(typeof global!=="undefined"){ // If we don't even have window, try global.
global.js_beautify=js_beautify;}})();}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],42:[function(require,module,exports){(function(process){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts,allowAboveRoot){ // if the path tries to go above the root, `up` ends up > 0
var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==='.'){parts.splice(i,1);}else if(last==='..'){parts.splice(i,1);up++;}else if(up){parts.splice(i,1);up--;}} // if the path is allowed to go above the root, restore leading ..s
if(allowAboveRoot){for(;up--;up){parts.unshift('..');}}return parts;} // Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;var splitPath=function splitPath(filename){return splitPathRe.exec(filename).slice(1);}; // path.resolve([from ...], to)
// posix version
exports.resolve=function(){var resolvedPath='',resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:process.cwd(); // Skip empty and invalid entries
if(typeof path!=='string'){throw new TypeError('Arguments to path.resolve must be strings');}else if(!path){continue;}resolvedPath=path+'/'+resolvedPath;resolvedAbsolute=path.charAt(0)==='/';} // At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)
// Normalize the path
resolvedPath=normalizeArray(filter(resolvedPath.split('/'),function(p){return !!p;}),!resolvedAbsolute).join('/');return (resolvedAbsolute?'/':'')+resolvedPath||'.';}; // path.normalize(path)
// posix version
exports.normalize=function(path){var isAbsolute=exports.isAbsolute(path),trailingSlash=substr(path,-1)==='/'; // Normalize the path
path=normalizeArray(filter(path.split('/'),function(p){return !!p;}),!isAbsolute).join('/');if(!path&&!isAbsolute){path='.';}if(path&&trailingSlash){path+='/';}return (isAbsolute?'/':'')+path;}; // posix version
exports.isAbsolute=function(path){return path.charAt(0)==='/';}; // posix version
exports.join=function(){var paths=Array.prototype.slice.call(arguments,0);return exports.normalize(filter(paths,function(p,index){if(typeof p!=='string'){throw new TypeError('Arguments to path.join must be strings');}return p;}).join('/'));}; // path.relative(from, to)
// posix version
exports.relative=function(from,to){from=exports.resolve(from).substr(1);to=exports.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=='')break;}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=='')break;}if(start>end)return [];return arr.slice(start,end-start+1);}var fromParts=trim(from.split('/'));var toParts=trim(to.split('/'));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break;}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push('..');}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join('/');};exports.sep='/';exports.delimiter=':';exports.dirname=function(path){var result=splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){ // No dirname whatsoever
return '.';}if(dir){ // It has a dirname, strip trailing slash
dir=dir.substr(0,dir.length-1);}return root+dir;};exports.basename=function(path,ext){var f=splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?
if(ext&&f.substr(-1*ext.length)===ext){f=f.substr(0,f.length-ext.length);}return f;};exports.extname=function(path){return splitPath(path)[3];};function filter(xs,f){if(xs.filter)return xs.filter(f);var res=[];for(var i=0;i<xs.length;i++){if(f(xs[i],i,xs))res.push(xs[i]);}return res;} // String.prototype.substr - negative index don't work in IE8
var substr='ab'.substr(-1)==='b'?function(str,start,len){return str.substr(start,len);}:function(str,start,len){if(start<0)start=str.length+start;return str.substr(start,len);};}).call(this,require("FT5ORs"));},{"FT5ORs":44}],43:[function(require,module,exports){var isarray=require('isarray'); /**
 * Expose `pathToRegexp`.
 */module.exports=pathToRegexp;module.exports.parse=parse;module.exports.compile=compile;module.exports.tokensToFunction=tokensToFunction;module.exports.tokensToRegExp=tokensToRegExp; /**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */var PATH_REGEXP=new RegExp([ // Match escaped characters that would otherwise appear in future matches.
// This allows the user to escape special characters that won't transform.
'(\\\\.)', // Match Express-style parameters and un-named parameters with a prefix
// and optional suffixes. Matches appear as:
//
// "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
// "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
// "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
'([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'].join('|'),'g'); /**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */function parse(str){var tokens=[];var key=0;var index=0;var path='';var res;while((res=PATH_REGEXP.exec(str))!=null){var m=res[0];var escaped=res[1];var offset=res.index;path+=str.slice(index,offset);index=offset+m.length; // Ignore already escaped sequences.
if(escaped){path+=escaped[1];continue;} // Push the current path onto the tokens.
if(path){tokens.push(path);path='';}var prefix=res[2];var name=res[3];var capture=res[4];var group=res[5];var suffix=res[6];var asterisk=res[7];var repeat=suffix==='+'||suffix==='*';var optional=suffix==='?'||suffix==='*';var delimiter=prefix||'/';var pattern=capture||group||(asterisk?'.*':'[^'+delimiter+']+?');tokens.push({name:name||key++,prefix:prefix||'',delimiter:delimiter,optional:optional,repeat:repeat,pattern:escapeGroup(pattern)});} // Match any characters still remaining.
if(index<str.length){path+=str.substr(index);} // If the path exists, push it onto the end.
if(path){tokens.push(path);}return tokens;} /**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */function compile(str){return tokensToFunction(parse(str));} /**
 * Expose a method for transforming tokens into the path function.
 */function tokensToFunction(tokens){ // Compile all the tokens into regexps.
var matches=new Array(tokens.length); // Compile all the patterns before compilation.
for(var i=0;i<tokens.length;i++){if(_typeof(tokens[i])==='object'){matches[i]=new RegExp('^'+tokens[i].pattern+'$');}}return function(obj){var path='';var data=obj||{};for(var i=0;i<tokens.length;i++){var token=tokens[i];if(typeof token==='string'){path+=token;continue;}var value=data[token.name];var segment;if(value==null){if(token.optional){continue;}else {throw new TypeError('Expected "'+token.name+'" to be defined');}}if(isarray(value)){if(!token.repeat){throw new TypeError('Expected "'+token.name+'" to not repeat, but received "'+value+'"');}if(value.length===0){if(token.optional){continue;}else {throw new TypeError('Expected "'+token.name+'" to not be empty');}}for(var j=0;j<value.length;j++){segment=encodeURIComponent(value[j]);if(!matches[i].test(segment)){throw new TypeError('Expected all "'+token.name+'" to match "'+token.pattern+'", but received "'+segment+'"');}path+=(j===0?token.prefix:token.delimiter)+segment;}continue;}segment=encodeURIComponent(value);if(!matches[i].test(segment)){throw new TypeError('Expected "'+token.name+'" to match "'+token.pattern+'", but received "'+segment+'"');}path+=token.prefix+segment;}return path;};} /**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */function escapeString(str){return str.replace(/([.+*?=^!:${}()[\]|\/])/g,'\\$1');} /**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */function escapeGroup(group){return group.replace(/([=!:$\/()])/g,'\\$1');} /**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */function attachKeys(re,keys){re.keys=keys;return re;} /**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */function flags(options){return options.sensitive?'':'i';} /**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */function regexpToRegexp(path,keys){ // Use a negative lookahead to match only capturing groups.
var groups=path.source.match(/\((?!\?)/g);if(groups){for(var i=0;i<groups.length;i++){keys.push({name:i,prefix:null,delimiter:null,optional:false,repeat:false,pattern:null});}}return attachKeys(path,keys);} /**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */function arrayToRegexp(path,keys,options){var parts=[];for(var i=0;i<path.length;i++){parts.push(pathToRegexp(path[i],keys,options).source);}var regexp=new RegExp('(?:'+parts.join('|')+')',flags(options));return attachKeys(regexp,keys);} /**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */function stringToRegexp(path,keys,options){var tokens=parse(path);var re=tokensToRegExp(tokens,options); // Attach keys back to the regexp.
for(var i=0;i<tokens.length;i++){if(typeof tokens[i]!=='string'){keys.push(tokens[i]);}}return attachKeys(re,keys);} /**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */function tokensToRegExp(tokens,options){options=options||{};var strict=options.strict;var end=options.end!==false;var route='';var lastToken=tokens[tokens.length-1];var endsWithSlash=typeof lastToken==='string'&&/\/$/.test(lastToken); // Iterate over the tokens and create our regexp string.
for(var i=0;i<tokens.length;i++){var token=tokens[i];if(typeof token==='string'){route+=escapeString(token);}else {var prefix=escapeString(token.prefix);var capture=token.pattern;if(token.repeat){capture+='(?:'+prefix+capture+')*';}if(token.optional){if(prefix){capture='(?:'+prefix+'('+capture+'))?';}else {capture='('+capture+')?';}}else {capture=prefix+'('+capture+')';}route+=capture;}} // In non-strict mode we allow a slash at the end of match. If the path to
// match already ends with a slash, we remove it for consistency. The slash
// is valid at the end of a path match, not in the middle. This is important
// in non-ending mode, where "/test/" shouldn't match "/test//route".
if(!strict){route=(endsWithSlash?route.slice(0,-2):route)+'(?:\\/(?=$))?';}if(end){route+='$';}else { // In non-ending mode, we need the capturing groups to match as much as
// possible by using a positive lookahead to the end or next path segment.
route+=strict&&endsWithSlash?'':'(?=\\/|$)';}return new RegExp('^'+route,flags(options));} /**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */function pathToRegexp(path,keys,options){keys=keys||[];if(!isarray(keys)){options=keys;keys=[];}else if(!options){options={};}if(path instanceof RegExp){return regexpToRegexp(path,keys,options);}if(isarray(path)){return arrayToRegexp(path,keys,options);}return stringToRegexp(path,keys,options);}},{"isarray":12}],44:[function(require,module,exports){ // shim for using process in browser
var process=module.exports={};process.nextTick=function(){var canSetImmediate=typeof window!=='undefined'&&window.setImmediate;var canPost=typeof window!=='undefined'&&window.postMessage&&window.addEventListener;if(canSetImmediate){return function(f){return window.setImmediate(f);};}if(canPost){var queue=[];window.addEventListener('message',function(ev){var source=ev.source;if((source===window||source===null)&&ev.data==='process-tick'){ev.stopPropagation();if(queue.length>0){var fn=queue.shift();fn();}}},true);return function nextTick(fn){queue.push(fn);window.postMessage('process-tick','*');};}return function nextTick(fn){setTimeout(fn,0);};}();process.title='browser';process.browser=true;process.env={};process.argv=[];function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported');}; // TODO(shtylman)
process.cwd=function(){return '/';};process.chdir=function(dir){throw new Error('process.chdir is not supported');};},{}],45:[function(require,module,exports){ /**
 * This file automatically generated from `pre-publish.js`.
 * Do not manually edit.
 */module.exports={"area":true,"base":true,"br":true,"col":true,"embed":true,"hr":true,"img":true,"input":true,"keygen":true,"link":true,"menuitem":true,"meta":true,"param":true,"source":true,"track":true,"wbr":true};},{}],46:[function(require,module,exports){'use strict';var detect=require('acorn-globals');var acorn=require('acorn');var walk=require('acorn/dist/walk'); // polyfill for https://github.com/marijnh/acorn/pull/231
walk.base.ExportNamedDeclaration=walk.base.ExportDefaultDeclaration=function(node,st,c){return c(node.declaration,st);};walk.base.ImportDefaultSpecifier=walk.base.ImportNamespaceSpecifier=function(){}; // hacky fix for https://github.com/marijnh/acorn/issues/227
function reallyParse(source){try{return acorn.parse(source,{ecmaVersion:5,allowReturnOutsideFunction:true});}catch(ex){if(ex.name!=='SyntaxError'){throw ex;}return acorn.parse(source,{ecmaVersion:6,allowReturnOutsideFunction:true});}}module.exports=addWith; /**
 * Mimic `with` as far as possible but at compile time
 *
 * @param {String} obj The object part of a with expression
 * @param {String} src The body of the with expression
 * @param {Array.<String>} exclude A list of variable names to explicitly exclude
 */function addWith(obj,src,exclude){obj=obj+'';src=src+'';exclude=exclude||[];exclude=exclude.concat(detect(obj).map(function(global){return global.name;}));var vars=detect(src).map(function(global){return global.name;}).filter(function(v){return exclude.indexOf(v)===-1;});if(vars.length===0)return src;var declareLocal='';var local='locals_for_with';var result='result_of_with';if(/^[a-zA-Z0-9$_]+$/.test(obj)){local=obj;}else {while(vars.indexOf(local)!=-1||exclude.indexOf(local)!=-1){local+='_';}declareLocal='var '+local+' = ('+obj+')';}while(vars.indexOf(result)!=-1||exclude.indexOf(result)!=-1){result+='_';}var inputVars=vars.map(function(v){return JSON.stringify(v)+' in '+local+'?'+local+'.'+v+':'+'typeof '+v+'!=="undefined"?'+v+':undefined';});src='(function ('+vars.join(', ')+') {'+src+'}.call(this'+inputVars.map(function(v){return ','+v;}).join('')+'))';return ';'+declareLocal+';'+unwrapReturns(src,result)+';';} /**
 * Take a self calling function, and unwrap it such that return inside the function
 * results in return outside the function
 *
 * @param {String} src    Some JavaScript code representing a self-calling function
 * @param {String} result A temporary variable to store the result in
 */function unwrapReturns(src,result){var originalSource=src;var hasReturn=false;var ast=reallyParse(src);var ref;src=src.split(''); // get a reference to the function that was inserted to add an inner context
if((ref=ast.body).length!==1||(ref=ref[0]).type!=='ExpressionStatement'||(ref=ref.expression).type!=='CallExpression'||(ref=ref.callee).type!=='MemberExpression'||ref.computed!==false||ref.property.name!=='call'||(ref=ref.object).type!=='FunctionExpression')throw new Error('AST does not seem to represent a self-calling function');var fn=ref;walk.recursive(ast,null,{Function:function Function(node,st,c){if(node===fn){c(node.body,st,"ScopeBody");}},ReturnStatement:function ReturnStatement(node){hasReturn=true;replace(node,'return {value: '+source(node.argument)+'};');}});function source(node){return src.slice(node.start,node.end).join('');}function replace(node,str){for(var i=node.start;i<node.end;i++){src[i]='';}src[node.start]=str;}if(!hasReturn)return originalSource;else return 'var '+result+'='+src.join('')+';if ('+result+') return '+result+'.value';}},{"acorn":47,"acorn-globals":1,"acorn/dist/walk":48}],47:[function(require,module,exports){(function(global){(function(f){if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else {var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else {g=this;}g.acorn=f();}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;}({1:[function(_dereq_,module,exports){ // The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
"use strict";exports.parse=parse; // This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.
exports.parseExpressionAt=parseExpressionAt; // Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenize` export provides an interface to the tokenizer.
exports.tokenizer=tokenizer;exports.__esModule=true; // Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/marijnh/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js
var _state=_dereq_("./state");var Parser=_state.Parser;var _options=_dereq_("./options");var getOptions=_options.getOptions;_dereq_("./parseutil");_dereq_("./statement");_dereq_("./lval");_dereq_("./expression");exports.Parser=_state.Parser;exports.plugins=_state.plugins;exports.defaultOptions=_options.defaultOptions;var _location=_dereq_("./location");exports.SourceLocation=_location.SourceLocation;exports.getLineInfo=_location.getLineInfo;exports.Node=_dereq_("./node").Node;var _tokentype=_dereq_("./tokentype");exports.TokenType=_tokentype.TokenType;exports.tokTypes=_tokentype.types;var _tokencontext=_dereq_("./tokencontext");exports.TokContext=_tokencontext.TokContext;exports.tokContexts=_tokencontext.types;var _identifier=_dereq_("./identifier");exports.isIdentifierChar=_identifier.isIdentifierChar;exports.isIdentifierStart=_identifier.isIdentifierStart;exports.Token=_dereq_("./tokenize").Token;var _whitespace=_dereq_("./whitespace");exports.isNewLine=_whitespace.isNewLine;exports.lineBreak=_whitespace.lineBreak;exports.lineBreakG=_whitespace.lineBreakG;var version="1.2.2";exports.version=version;function parse(input,options){var p=parser(options,input);var startPos=p.pos,startLoc=p.options.locations&&p.curPosition();p.nextToken();return p.parseTopLevel(p.options.program||p.startNodeAt(startPos,startLoc));}function parseExpressionAt(input,pos,options){var p=parser(options,input,pos);p.nextToken();return p.parseExpression();}function tokenizer(input,options){return parser(options,input);}function parser(options,input){return new Parser(getOptions(options),String(input));}},{"./expression":6,"./identifier":7,"./location":8,"./lval":9,"./node":10,"./options":11,"./parseutil":12,"./state":13,"./statement":14,"./tokencontext":15,"./tokenize":16,"./tokentype":17,"./whitespace":19}],2:[function(_dereq_,module,exports){if(typeof Object.create==='function'){ // implementation from standard node.js 'util' module
module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor;ctor.prototype=Object.create(superCtor.prototype,{constructor:{value:ctor,enumerable:false,writable:true,configurable:true}});};}else { // old school shim for old browsers
module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor;var TempCtor=function TempCtor(){};TempCtor.prototype=superCtor.prototype;ctor.prototype=new TempCtor();ctor.prototype.constructor=ctor;};}},{}],3:[function(_dereq_,module,exports){ // shim for using process in browser
var process=module.exports={};var queue=[];var draining=false;function drainQueue(){if(draining){return;}draining=true;var currentQueue;var len=queue.length;while(len){currentQueue=queue;queue=[];var i=-1;while(++i<len){currentQueue[i]();}len=queue.length;}draining=false;}process.nextTick=function(fun){queue.push(fun);if(!draining){setTimeout(drainQueue,0);}};process.title='browser';process.browser=true;process.env={};process.argv=[];process.version=''; // empty string to avoid regexp issues
process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported');}; // TODO(shtylman)
process.cwd=function(){return '/';};process.chdir=function(dir){throw new Error('process.chdir is not supported');};process.umask=function(){return 0;};},{}],4:[function(_dereq_,module,exports){module.exports=function isBuffer(arg){return arg&&(typeof arg==="undefined"?"undefined":_typeof(arg))==='object'&&typeof arg.copy==='function'&&typeof arg.fill==='function'&&typeof arg.readUInt8==='function';};},{}],5:[function(_dereq_,module,exports){(function(process,global){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var formatRegExp=/%[sdj%]/g;exports.format=function(f){if(!isString(f)){var objects=[];for(var i=0;i<arguments.length;i++){objects.push(inspect(arguments[i]));}return objects.join(' ');}var i=1;var args=arguments;var len=args.length;var str=String(f).replace(formatRegExp,function(x){if(x==='%%')return '%';if(i>=len)return x;switch(x){case '%s':return String(args[i++]);case '%d':return Number(args[i++]);case '%j':try{return JSON.stringify(args[i++]);}catch(_){return '[Circular]';}default:return x;}});for(var x=args[i];i<len;x=args[++i]){if(isNull(x)||!isObject(x)){str+=' '+x;}else {str+=' '+inspect(x);}}return str;}; // Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate=function(fn,msg){ // Allow for deprecating things in the process of starting up.
if(isUndefined(global.process)){return function(){return exports.deprecate(fn,msg).apply(this,arguments);};}if(process.noDeprecation===true){return fn;}var warned=false;function deprecated(){if(!warned){if(process.throwDeprecation){throw new Error(msg);}else if(process.traceDeprecation){console.trace(msg);}else {console.error(msg);}warned=true;}return fn.apply(this,arguments);}return deprecated;};var debugs={};var debugEnviron;exports.debuglog=function(set){if(isUndefined(debugEnviron))debugEnviron=process.env.NODE_DEBUG||'';set=set.toUpperCase();if(!debugs[set]){if(new RegExp('\\b'+set+'\\b','i').test(debugEnviron)){var pid=process.pid;debugs[set]=function(){var msg=exports.format.apply(exports,arguments);console.error('%s %d: %s',set,pid,msg);};}else {debugs[set]=function(){};}}return debugs[set];}; /**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */ /* legacy: obj, showHidden, depth, colors*/function inspect(obj,opts){ // default options
var ctx={seen:[],stylize:stylizeNoColor}; // legacy...
if(arguments.length>=3)ctx.depth=arguments[2];if(arguments.length>=4)ctx.colors=arguments[3];if(isBoolean(opts)){ // legacy...
ctx.showHidden=opts;}else if(opts){ // got an "options" object
exports._extend(ctx,opts);} // set default options
if(isUndefined(ctx.showHidden))ctx.showHidden=false;if(isUndefined(ctx.depth))ctx.depth=2;if(isUndefined(ctx.colors))ctx.colors=false;if(isUndefined(ctx.customInspect))ctx.customInspect=true;if(ctx.colors)ctx.stylize=stylizeWithColor;return formatValue(ctx,obj,ctx.depth);}exports.inspect=inspect; // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors={'bold':[1,22],'italic':[3,23],'underline':[4,24],'inverse':[7,27],'white':[37,39],'grey':[90,39],'black':[30,39],'blue':[34,39],'cyan':[36,39],'green':[32,39],'magenta':[35,39],'red':[31,39],'yellow':[33,39]}; // Don't use 'blue' not visible on cmd.exe
inspect.styles={'special':'cyan','number':'yellow','boolean':'yellow','undefined':'grey','null':'bold','string':'green','date':'magenta', // "name": intentionally not styling
'regexp':'red'};function stylizeWithColor(str,styleType){var style=inspect.styles[styleType];if(style){return "\u001b["+inspect.colors[style][0]+'m'+str+"\u001b["+inspect.colors[style][1]+'m';}else {return str;}}function stylizeNoColor(str,styleType){return str;}function arrayToHash(array){var hash={};array.forEach(function(val,idx){hash[val]=true;});return hash;}function formatValue(ctx,value,recurseTimes){ // Provide a hook for user-specified inspect functions.
// Check that value is an object with an inspect function on it
if(ctx.customInspect&&value&&isFunction(value.inspect)&& // Filter out the util module, it's inspect function is special
value.inspect!==exports.inspect&& // Also filter out any prototype objects using the circular check.
!(value.constructor&&value.constructor.prototype===value)){var ret=value.inspect(recurseTimes,ctx);if(!isString(ret)){ret=formatValue(ctx,ret,recurseTimes);}return ret;} // Primitive types cannot have properties
var primitive=formatPrimitive(ctx,value);if(primitive){return primitive;} // Look up the keys of the object.
var keys=Object.keys(value);var visibleKeys=arrayToHash(keys);if(ctx.showHidden){keys=Object.getOwnPropertyNames(value);} // IE doesn't make error fields non-enumerable
// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
if(isError(value)&&(keys.indexOf('message')>=0||keys.indexOf('description')>=0)){return formatError(value);} // Some type of object without properties can be shortcutted.
if(keys.length===0){if(isFunction(value)){var name=value.name?': '+value.name:'';return ctx.stylize('[Function'+name+']','special');}if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}if(isDate(value)){return ctx.stylize(Date.prototype.toString.call(value),'date');}if(isError(value)){return formatError(value);}}var base='',array=false,braces=['{','}']; // Make Array say that they are Array
if(isArray(value)){array=true;braces=['[',']'];} // Make functions say that they are functions
if(isFunction(value)){var n=value.name?': '+value.name:'';base=' [Function'+n+']';} // Make RegExps say that they are RegExps
if(isRegExp(value)){base=' '+RegExp.prototype.toString.call(value);} // Make dates with properties first say the date
if(isDate(value)){base=' '+Date.prototype.toUTCString.call(value);} // Make error with message first say the error
if(isError(value)){base=' '+formatError(value);}if(keys.length===0&&(!array||value.length==0)){return braces[0]+base+braces[1];}if(recurseTimes<0){if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}else {return ctx.stylize('[Object]','special');}}ctx.seen.push(value);var output;if(array){output=formatArray(ctx,value,recurseTimes,visibleKeys,keys);}else {output=keys.map(function(key){return formatProperty(ctx,value,recurseTimes,visibleKeys,key,array);});}ctx.seen.pop();return reduceToSingleString(output,base,braces);}function formatPrimitive(ctx,value){if(isUndefined(value))return ctx.stylize('undefined','undefined');if(isString(value)){var simple='\''+JSON.stringify(value).replace(/^"|"$/g,'').replace(/'/g,"\\'").replace(/\\"/g,'"')+'\'';return ctx.stylize(simple,'string');}if(isNumber(value))return ctx.stylize(''+value,'number');if(isBoolean(value))return ctx.stylize(''+value,'boolean'); // For some reason typeof null is "object", so special case here.
if(isNull(value))return ctx.stylize('null','null');}function formatError(value){return '['+Error.prototype.toString.call(value)+']';}function formatArray(ctx,value,recurseTimes,visibleKeys,keys){var output=[];for(var i=0,l=value.length;i<l;++i){if(hasOwnProperty(value,String(i))){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,String(i),true));}else {output.push('');}}keys.forEach(function(key){if(!key.match(/^\d+$/)){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,key,true));}});return output;}function formatProperty(ctx,value,recurseTimes,visibleKeys,key,array){var name,str,desc;desc=Object.getOwnPropertyDescriptor(value,key)||{value:value[key]};if(desc.get){if(desc.set){str=ctx.stylize('[Getter/Setter]','special');}else {str=ctx.stylize('[Getter]','special');}}else {if(desc.set){str=ctx.stylize('[Setter]','special');}}if(!hasOwnProperty(visibleKeys,key)){name='['+key+']';}if(!str){if(ctx.seen.indexOf(desc.value)<0){if(isNull(recurseTimes)){str=formatValue(ctx,desc.value,null);}else {str=formatValue(ctx,desc.value,recurseTimes-1);}if(str.indexOf('\n')>-1){if(array){str=str.split('\n').map(function(line){return '  '+line;}).join('\n').substr(2);}else {str='\n'+str.split('\n').map(function(line){return '   '+line;}).join('\n');}}}else {str=ctx.stylize('[Circular]','special');}}if(isUndefined(name)){if(array&&key.match(/^\d+$/)){return str;}name=JSON.stringify(''+key);if(name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){name=name.substr(1,name.length-2);name=ctx.stylize(name,'name');}else {name=name.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");name=ctx.stylize(name,'string');}}return name+': '+str;}function reduceToSingleString(output,base,braces){var numLinesEst=0;var length=output.reduce(function(prev,cur){numLinesEst++;if(cur.indexOf('\n')>=0)numLinesEst++;return prev+cur.replace(/\u001b\[\d\d?m/g,'').length+1;},0);if(length>60){return braces[0]+(base===''?'':base+'\n ')+' '+output.join(',\n  ')+' '+braces[1];}return braces[0]+base+' '+output.join(', ')+' '+braces[1];} // NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar){return Array.isArray(ar);}exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean';}exports.isBoolean=isBoolean;function isNull(arg){return arg===null;}exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null;}exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number';}exports.isNumber=isNumber;function isString(arg){return typeof arg==='string';}exports.isString=isString;function isSymbol(arg){return (typeof arg==="undefined"?"undefined":_typeof(arg))==='symbol';}exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0;}exports.isUndefined=isUndefined;function isRegExp(re){return isObject(re)&&objectToString(re)==='[object RegExp]';}exports.isRegExp=isRegExp;function isObject(arg){return (typeof arg==="undefined"?"undefined":_typeof(arg))==='object'&&arg!==null;}exports.isObject=isObject;function isDate(d){return isObject(d)&&objectToString(d)==='[object Date]';}exports.isDate=isDate;function isError(e){return isObject(e)&&(objectToString(e)==='[object Error]'||e instanceof Error);}exports.isError=isError;function isFunction(arg){return typeof arg==='function';}exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||(typeof arg==="undefined"?"undefined":_typeof(arg))==='symbol'|| // ES6 symbol
typeof arg==='undefined';}exports.isPrimitive=isPrimitive;exports.isBuffer=_dereq_('./support/isBuffer');function objectToString(o){return Object.prototype.toString.call(o);}function pad(n){return n<10?'0'+n.toString(10):n.toString(10);}var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; // 26 Feb 16:19:34
function timestamp(){var d=new Date();var time=[pad(d.getHours()),pad(d.getMinutes()),pad(d.getSeconds())].join(':');return [d.getDate(),months[d.getMonth()],time].join(' ');} // log is just a thin wrapper to console.log that prepends a timestamp
exports.log=function(){console.log('%s - %s',timestamp(),exports.format.apply(exports,arguments));}; /**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */exports.inherits=_dereq_('inherits');exports._extend=function(origin,add){ // Don't do anything if add isn't an object
if(!add||!isObject(add))return origin;var keys=Object.keys(add);var i=keys.length;while(i--){origin[keys[i]]=add[keys[i]];}return origin;};function hasOwnProperty(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop);}}).call(this,_dereq_('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"./support/isBuffer":4,"_process":3,"inherits":2}],6:[function(_dereq_,module,exports){ // A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser
"use strict";var tt=_dereq_("./tokentype").types;var Parser=_dereq_("./state").Parser;var reservedWords=_dereq_("./identifier").reservedWords;var has=_dereq_("./util").has;var pp=Parser.prototype; // Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.
pp.checkPropClash=function(prop,propHash){if(this.options.ecmaVersion>=6)return;var key=prop.key,name=undefined;switch(key.type){case "Identifier":name=key.name;break;case "Literal":name=String(key.value);break;default:return;}var kind=prop.kind||"init",other=undefined;if(has(propHash,name)){other=propHash[name];var isGetSet=kind!=="init";if((this.strict||isGetSet)&&other[kind]||!(isGetSet^other.init))this.raise(key.start,"Redefinition of property");}else {other=propHash[name]={init:false,get:false,set:false};}other[kind]=true;}; // ### Expression parsing
// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.
// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).
pp.parseExpression=function(noIn,refShorthandDefaultPos){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseMaybeAssign(noIn,refShorthandDefaultPos);if(this.type===tt.comma){var node=this.startNodeAt(startPos,startLoc);node.expressions=[expr];while(this.eat(tt.comma)){node.expressions.push(this.parseMaybeAssign(noIn,refShorthandDefaultPos));}return this.finishNode(node,"SequenceExpression");}return expr;}; // Parse an assignment expression. This includes applications of
// operators like `+=`.
pp.parseMaybeAssign=function(noIn,refShorthandDefaultPos,afterLeftParse){if(this.type==tt._yield&&this.inGenerator)return this.parseYield();var failOnShorthandAssign=undefined;if(!refShorthandDefaultPos){refShorthandDefaultPos={start:0};failOnShorthandAssign=true;}else {failOnShorthandAssign=false;}var startPos=this.start,startLoc=this.startLoc;if(this.type==tt.parenL||this.type==tt.name)this.potentialArrowAt=this.start;var left=this.parseMaybeConditional(noIn,refShorthandDefaultPos);if(afterLeftParse)left=afterLeftParse.call(this,left,startPos,startLoc);if(this.type.isAssign){var node=this.startNodeAt(startPos,startLoc);node.operator=this.value;node.left=this.type===tt.eq?this.toAssignable(left):left;refShorthandDefaultPos.start=0; // reset because shorthand default was used correctly
this.checkLVal(left);this.next();node.right=this.parseMaybeAssign(noIn);return this.finishNode(node,"AssignmentExpression");}else if(failOnShorthandAssign&&refShorthandDefaultPos.start){this.unexpected(refShorthandDefaultPos.start);}return left;}; // Parse a ternary conditional (`?:`) operator.
pp.parseMaybeConditional=function(noIn,refShorthandDefaultPos){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseExprOps(noIn,refShorthandDefaultPos);if(refShorthandDefaultPos&&refShorthandDefaultPos.start)return expr;if(this.eat(tt.question)){var node=this.startNodeAt(startPos,startLoc);node.test=expr;node.consequent=this.parseMaybeAssign();this.expect(tt.colon);node.alternate=this.parseMaybeAssign(noIn);return this.finishNode(node,"ConditionalExpression");}return expr;}; // Start the precedence parser.
pp.parseExprOps=function(noIn,refShorthandDefaultPos){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseMaybeUnary(refShorthandDefaultPos);if(refShorthandDefaultPos&&refShorthandDefaultPos.start)return expr;return this.parseExprOp(expr,startPos,startLoc,-1,noIn);}; // Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.
pp.parseExprOp=function(left,leftStartPos,leftStartLoc,minPrec,noIn){var prec=this.type.binop;if(Array.isArray(leftStartPos)){if(this.options.locations&&noIn===undefined){ // shift arguments to left by one
noIn=minPrec;minPrec=leftStartLoc; // flatten leftStartPos
leftStartLoc=leftStartPos[1];leftStartPos=leftStartPos[0];}}if(prec!=null&&(!noIn||this.type!==tt._in)){if(prec>minPrec){var node=this.startNodeAt(leftStartPos,leftStartLoc);node.left=left;node.operator=this.value;var op=this.type;this.next();var startPos=this.start,startLoc=this.startLoc;node.right=this.parseExprOp(this.parseMaybeUnary(),startPos,startLoc,prec,noIn);this.finishNode(node,op===tt.logicalOR||op===tt.logicalAND?"LogicalExpression":"BinaryExpression");return this.parseExprOp(node,leftStartPos,leftStartLoc,minPrec,noIn);}}return left;}; // Parse unary operators, both prefix and postfix.
pp.parseMaybeUnary=function(refShorthandDefaultPos){if(this.type.prefix){var node=this.startNode(),update=this.type===tt.incDec;node.operator=this.value;node.prefix=true;this.next();node.argument=this.parseMaybeUnary();if(refShorthandDefaultPos&&refShorthandDefaultPos.start)this.unexpected(refShorthandDefaultPos.start);if(update)this.checkLVal(node.argument);else if(this.strict&&node.operator==="delete"&&node.argument.type==="Identifier")this.raise(node.start,"Deleting local variable in strict mode");return this.finishNode(node,update?"UpdateExpression":"UnaryExpression");}var startPos=this.start,startLoc=this.startLoc;var expr=this.parseExprSubscripts(refShorthandDefaultPos);if(refShorthandDefaultPos&&refShorthandDefaultPos.start)return expr;while(this.type.postfix&&!this.canInsertSemicolon()){var node=this.startNodeAt(startPos,startLoc);node.operator=this.value;node.prefix=false;node.argument=expr;this.checkLVal(expr);this.next();expr=this.finishNode(node,"UpdateExpression");}return expr;}; // Parse call, dot, and `[]`-subscript expressions.
pp.parseExprSubscripts=function(refShorthandDefaultPos){var startPos=this.start,startLoc=this.startLoc;var expr=this.parseExprAtom(refShorthandDefaultPos);if(refShorthandDefaultPos&&refShorthandDefaultPos.start)return expr;return this.parseSubscripts(expr,startPos,startLoc);};pp.parseSubscripts=function(base,startPos,startLoc,noCalls){if(Array.isArray(startPos)){if(this.options.locations&&noCalls===undefined){ // shift arguments to left by one
noCalls=startLoc; // flatten startPos
startLoc=startPos[1];startPos=startPos[0];}}for(;;){if(this.eat(tt.dot)){var node=this.startNodeAt(startPos,startLoc);node.object=base;node.property=this.parseIdent(true);node.computed=false;base=this.finishNode(node,"MemberExpression");}else if(this.eat(tt.bracketL)){var node=this.startNodeAt(startPos,startLoc);node.object=base;node.property=this.parseExpression();node.computed=true;this.expect(tt.bracketR);base=this.finishNode(node,"MemberExpression");}else if(!noCalls&&this.eat(tt.parenL)){var node=this.startNodeAt(startPos,startLoc);node.callee=base;node.arguments=this.parseExprList(tt.parenR,false);base=this.finishNode(node,"CallExpression");}else if(this.type===tt.backQuote){var node=this.startNodeAt(startPos,startLoc);node.tag=base;node.quasi=this.parseTemplate();base=this.finishNode(node,"TaggedTemplateExpression");}else {return base;}}}; // Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.
pp.parseExprAtom=function(refShorthandDefaultPos){var node=undefined,canBeArrow=this.potentialArrowAt==this.start;switch(this.type){case tt._this:case tt._super:var type=this.type===tt._this?"ThisExpression":"Super";node=this.startNode();this.next();return this.finishNode(node,type);case tt._yield:if(this.inGenerator)this.unexpected();case tt.name:var startPos=this.start,startLoc=this.startLoc;var id=this.parseIdent(this.type!==tt.name);if(canBeArrow&&!this.canInsertSemicolon()&&this.eat(tt.arrow))return this.parseArrowExpression(this.startNodeAt(startPos,startLoc),[id]);return id;case tt.regexp:var value=this.value;node=this.parseLiteral(value.value);node.regex={pattern:value.pattern,flags:value.flags};return node;case tt.num:case tt.string:return this.parseLiteral(this.value);case tt._null:case tt._true:case tt._false:node=this.startNode();node.value=this.type===tt._null?null:this.type===tt._true;node.raw=this.type.keyword;this.next();return this.finishNode(node,"Literal");case tt.parenL:return this.parseParenAndDistinguishExpression(canBeArrow);case tt.bracketL:node=this.startNode();this.next(); // check whether this is array comprehension or regular array
if(this.options.ecmaVersion>=7&&this.type===tt._for){return this.parseComprehension(node,false);}node.elements=this.parseExprList(tt.bracketR,true,true,refShorthandDefaultPos);return this.finishNode(node,"ArrayExpression");case tt.braceL:return this.parseObj(false,refShorthandDefaultPos);case tt._function:node=this.startNode();this.next();return this.parseFunction(node,false);case tt._class:return this.parseClass(this.startNode(),false);case tt._new:return this.parseNew();case tt.backQuote:return this.parseTemplate();default:this.unexpected();}};pp.parseLiteral=function(value){var node=this.startNode();node.value=value;node.raw=this.input.slice(this.start,this.end);this.next();return this.finishNode(node,"Literal");};pp.parseParenExpression=function(){this.expect(tt.parenL);var val=this.parseExpression();this.expect(tt.parenR);return val;};pp.parseParenAndDistinguishExpression=function(canBeArrow){var startPos=this.start,startLoc=this.startLoc,val=undefined;if(this.options.ecmaVersion>=6){this.next();if(this.options.ecmaVersion>=7&&this.type===tt._for){return this.parseComprehension(this.startNodeAt(startPos,startLoc),true);}var innerStartPos=this.start,innerStartLoc=this.startLoc;var exprList=[],first=true;var refShorthandDefaultPos={start:0},spreadStart=undefined,innerParenStart=undefined;while(this.type!==tt.parenR){first?first=false:this.expect(tt.comma);if(this.type===tt.ellipsis){spreadStart=this.start;exprList.push(this.parseParenItem(this.parseRest()));break;}else {if(this.type===tt.parenL&&!innerParenStart){innerParenStart=this.start;}exprList.push(this.parseMaybeAssign(false,refShorthandDefaultPos,this.parseParenItem));}}var innerEndPos=this.start,innerEndLoc=this.startLoc;this.expect(tt.parenR);if(canBeArrow&&!this.canInsertSemicolon()&&this.eat(tt.arrow)){if(innerParenStart)this.unexpected(innerParenStart);return this.parseParenArrowList(startPos,startLoc,exprList);}if(!exprList.length)this.unexpected(this.lastTokStart);if(spreadStart)this.unexpected(spreadStart);if(refShorthandDefaultPos.start)this.unexpected(refShorthandDefaultPos.start);if(exprList.length>1){val=this.startNodeAt(innerStartPos,innerStartLoc);val.expressions=exprList;this.finishNodeAt(val,"SequenceExpression",innerEndPos,innerEndLoc);}else {val=exprList[0];}}else {val=this.parseParenExpression();}if(this.options.preserveParens){var par=this.startNodeAt(startPos,startLoc);par.expression=val;return this.finishNode(par,"ParenthesizedExpression");}else {return val;}};pp.parseParenItem=function(item){return item;};pp.parseParenArrowList=function(startPos,startLoc,exprList){return this.parseArrowExpression(this.startNodeAt(startPos,startLoc),exprList);}; // New's precedence is slightly tricky. It must allow its argument
// to be a `[]` or dot subscript expression, but not a call — at
// least, not without wrapping it in parentheses. Thus, it uses the
var empty=[];pp.parseNew=function(){var node=this.startNode();var meta=this.parseIdent(true);if(this.options.ecmaVersion>=6&&this.eat(tt.dot)){node.meta=meta;node.property=this.parseIdent(true);if(node.property.name!=="target")this.raise(node.property.start,"The only valid meta property for new is new.target");return this.finishNode(node,"MetaProperty");}var startPos=this.start,startLoc=this.startLoc;node.callee=this.parseSubscripts(this.parseExprAtom(),startPos,startLoc,true);if(this.eat(tt.parenL))node.arguments=this.parseExprList(tt.parenR,false);else node.arguments=empty;return this.finishNode(node,"NewExpression");}; // Parse template expression.
pp.parseTemplateElement=function(){var elem=this.startNode();elem.value={raw:this.input.slice(this.start,this.end),cooked:this.value};this.next();elem.tail=this.type===tt.backQuote;return this.finishNode(elem,"TemplateElement");};pp.parseTemplate=function(){var node=this.startNode();this.next();node.expressions=[];var curElt=this.parseTemplateElement();node.quasis=[curElt];while(!curElt.tail){this.expect(tt.dollarBraceL);node.expressions.push(this.parseExpression());this.expect(tt.braceR);node.quasis.push(curElt=this.parseTemplateElement());}this.next();return this.finishNode(node,"TemplateLiteral");}; // Parse an object literal or binding pattern.
pp.parseObj=function(isPattern,refShorthandDefaultPos){var node=this.startNode(),first=true,propHash={};node.properties=[];this.next();while(!this.eat(tt.braceR)){if(!first){this.expect(tt.comma);if(this.afterTrailingComma(tt.braceR))break;}else first=false;var prop=this.startNode(),isGenerator=undefined,startPos=undefined,startLoc=undefined;if(this.options.ecmaVersion>=6){prop.method=false;prop.shorthand=false;if(isPattern||refShorthandDefaultPos){startPos=this.start;startLoc=this.startLoc;}if(!isPattern)isGenerator=this.eat(tt.star);}this.parsePropertyName(prop);this.parsePropertyValue(prop,isPattern,isGenerator,startPos,startLoc,refShorthandDefaultPos);this.checkPropClash(prop,propHash);node.properties.push(this.finishNode(prop,"Property"));}return this.finishNode(node,isPattern?"ObjectPattern":"ObjectExpression");};pp.parsePropertyValue=function(prop,isPattern,isGenerator,startPos,startLoc,refShorthandDefaultPos){if(this.eat(tt.colon)){prop.value=isPattern?this.parseMaybeDefault(this.start,this.startLoc):this.parseMaybeAssign(false,refShorthandDefaultPos);prop.kind="init";}else if(this.options.ecmaVersion>=6&&this.type===tt.parenL){if(isPattern)this.unexpected();prop.kind="init";prop.method=true;prop.value=this.parseMethod(isGenerator);}else if(this.options.ecmaVersion>=5&&!prop.computed&&prop.key.type==="Identifier"&&(prop.key.name==="get"||prop.key.name==="set")&&this.type!=tt.comma&&this.type!=tt.braceR){if(isGenerator||isPattern)this.unexpected();prop.kind=prop.key.name;this.parsePropertyName(prop);prop.value=this.parseMethod(false);}else if(this.options.ecmaVersion>=6&&!prop.computed&&prop.key.type==="Identifier"){prop.kind="init";if(isPattern){if(this.isKeyword(prop.key.name)||this.strict&&(reservedWords.strictBind(prop.key.name)||reservedWords.strict(prop.key.name))||!this.options.allowReserved&&this.isReservedWord(prop.key.name))this.raise(prop.key.start,"Binding "+prop.key.name);prop.value=this.parseMaybeDefault(startPos,startLoc,prop.key);}else if(this.type===tt.eq&&refShorthandDefaultPos){if(!refShorthandDefaultPos.start)refShorthandDefaultPos.start=this.start;prop.value=this.parseMaybeDefault(startPos,startLoc,prop.key);}else {prop.value=prop.key;}prop.shorthand=true;}else this.unexpected();};pp.parsePropertyName=function(prop){if(this.options.ecmaVersion>=6){if(this.eat(tt.bracketL)){prop.computed=true;prop.key=this.parseMaybeAssign();this.expect(tt.bracketR);return prop.key;}else {prop.computed=false;}}return prop.key=this.type===tt.num||this.type===tt.string?this.parseExprAtom():this.parseIdent(true);}; // Initialize empty function node.
pp.initFunction=function(node){node.id=null;if(this.options.ecmaVersion>=6){node.generator=false;node.expression=false;}}; // Parse object or class method.
pp.parseMethod=function(isGenerator){var node=this.startNode();this.initFunction(node);this.expect(tt.parenL);node.params=this.parseBindingList(tt.parenR,false,false);var allowExpressionBody=undefined;if(this.options.ecmaVersion>=6){node.generator=isGenerator;allowExpressionBody=true;}else {allowExpressionBody=false;}this.parseFunctionBody(node,allowExpressionBody);return this.finishNode(node,"FunctionExpression");}; // Parse arrow function expression with given parameters.
pp.parseArrowExpression=function(node,params){this.initFunction(node);node.params=this.toAssignableList(params,true);this.parseFunctionBody(node,true);return this.finishNode(node,"ArrowFunctionExpression");}; // Parse function body and check parameters.
pp.parseFunctionBody=function(node,allowExpression){var isExpression=allowExpression&&this.type!==tt.braceL;if(isExpression){node.body=this.parseMaybeAssign();node.expression=true;}else { // Start a new scope with regard to labels and the `inFunction`
// flag (restore them to their old value afterwards).
var oldInFunc=this.inFunction,oldInGen=this.inGenerator,oldLabels=this.labels;this.inFunction=true;this.inGenerator=node.generator;this.labels=[];node.body=this.parseBlock(true);node.expression=false;this.inFunction=oldInFunc;this.inGenerator=oldInGen;this.labels=oldLabels;} // If this is a strict mode function, verify that argument names
// are not repeated, and it does not try to bind the words `eval`
// or `arguments`.
if(this.strict||!isExpression&&node.body.body.length&&this.isUseStrict(node.body.body[0])){var nameHash={},oldStrict=this.strict;this.strict=true;if(node.id)this.checkLVal(node.id,true);for(var i=0;i<node.params.length;i++){this.checkLVal(node.params[i],true,nameHash);}this.strict=oldStrict;}}; // Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).
pp.parseExprList=function(close,allowTrailingComma,allowEmpty,refShorthandDefaultPos){var elts=[],first=true;while(!this.eat(close)){if(!first){this.expect(tt.comma);if(allowTrailingComma&&this.afterTrailingComma(close))break;}else first=false;if(allowEmpty&&this.type===tt.comma){elts.push(null);}else {if(this.type===tt.ellipsis)elts.push(this.parseSpread(refShorthandDefaultPos));else elts.push(this.parseMaybeAssign(false,refShorthandDefaultPos));}}return elts;}; // Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.
pp.parseIdent=function(liberal){var node=this.startNode();if(liberal&&this.options.allowReserved=="never")liberal=false;if(this.type===tt.name){if(!liberal&&(!this.options.allowReserved&&this.isReservedWord(this.value)||this.strict&&reservedWords.strict(this.value)&&(this.options.ecmaVersion>=6||this.input.slice(this.start,this.end).indexOf("\\")==-1)))this.raise(this.start,"The keyword '"+this.value+"' is reserved");node.name=this.value;}else if(liberal&&this.type.keyword){node.name=this.type.keyword;}else {this.unexpected();}this.next();return this.finishNode(node,"Identifier");}; // Parses yield expression inside generator.
pp.parseYield=function(){var node=this.startNode();this.next();if(this.type==tt.semi||this.canInsertSemicolon()||this.type!=tt.star&&!this.type.startsExpr){node.delegate=false;node.argument=null;}else {node.delegate=this.eat(tt.star);node.argument=this.parseMaybeAssign();}return this.finishNode(node,"YieldExpression");}; // Parses array and generator comprehensions.
pp.parseComprehension=function(node,isGenerator){node.blocks=[];while(this.type===tt._for){var block=this.startNode();this.next();this.expect(tt.parenL);block.left=this.parseBindingAtom();this.checkLVal(block.left,true);this.expectContextual("of");block.right=this.parseExpression();this.expect(tt.parenR);node.blocks.push(this.finishNode(block,"ComprehensionBlock"));}node.filter=this.eat(tt._if)?this.parseParenExpression():null;node.body=this.parseExpression();this.expect(isGenerator?tt.parenR:tt.bracketR);node.generator=isGenerator;return this.finishNode(node,"ComprehensionExpression");};},{"./identifier":7,"./state":13,"./tokentype":17,"./util":18}],7:[function(_dereq_,module,exports){ // Test whether a given character code starts an identifier.
"use strict";exports.isIdentifierStart=isIdentifierStart; // Test whether a given character is part of an identifier.
exports.isIdentifierChar=isIdentifierChar;exports.__esModule=true; // This is a trick taken from Esprima. It turns out that, on
// non-Chrome browsers, to check whether a string is in a set, a
// predicate containing a big ugly `switch` statement is faster than
// a regular expression, and on Chrome the two are about on par.
// This function uses `eval` (non-lexical) to produce such a
// predicate from a space-separated string of words.
//
// It starts by sorting the words by length.
function makePredicate(words){words=words.split(" ");var f="",cats=[];out: for(var i=0;i<words.length;++i){for(var j=0;j<cats.length;++j){if(cats[j][0].length==words[i].length){cats[j].push(words[i]);continue out;}}cats.push([words[i]]);}function compareTo(arr){if(arr.length==1){return f+="return str === "+JSON.stringify(arr[0])+";";}f+="switch(str){";for(var i=0;i<arr.length;++i){f+="case "+JSON.stringify(arr[i])+":";}f+="return true}return false;";} // When there are more than three length categories, an outer
// switch first dispatches on the lengths, to save on comparisons.
if(cats.length>3){cats.sort(function(a,b){return b.length-a.length;});f+="switch(str.length){";for(var i=0;i<cats.length;++i){var cat=cats[i];f+="case "+cat[0].length+":";compareTo(cat);}f+="}" // Otherwise, simply generate a flat `switch` statement.
;}else {compareTo(words);}return new Function("str",f);} // Reserved word lists for various dialects of the language
var reservedWords={3:makePredicate("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile"),5:makePredicate("class enum extends super const export import"),6:makePredicate("enum await"),strict:makePredicate("implements interface let package private protected public static yield"),strictBind:makePredicate("eval arguments")};exports.reservedWords=reservedWords; // And the keywords
var ecma5AndLessKeywords="break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";var keywords={5:makePredicate(ecma5AndLessKeywords),6:makePredicate(ecma5AndLessKeywords+" let const class extends export import yield super")};exports.keywords=keywords; // ## Character categories
// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `tools/generate-identifier-regex.js`.
var nonASCIIidentifierStartChars="ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢲऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞭꞰꞱꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭟꭤꭥꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";var nonASCIIidentifierChars="‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣤ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏ᦰ-ᧀᧈᧉ᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︭︳︴﹍-﹏０-９＿";var nonASCIIidentifierStart=new RegExp("["+nonASCIIidentifierStartChars+"]");var nonASCIIidentifier=new RegExp("["+nonASCIIidentifierStartChars+nonASCIIidentifierChars+"]");nonASCIIidentifierStartChars=nonASCIIidentifierChars=null; // These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by tools/generate-identifier-regex.js
var astralIdentifierStartCodes=[0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,17,26,6,37,11,29,3,35,5,7,2,4,43,157,99,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,98,21,11,25,71,55,7,1,65,0,16,3,2,2,2,26,45,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,955,52,76,44,33,24,27,35,42,34,4,0,13,47,15,3,22,0,38,17,2,24,133,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,32,4,287,47,21,1,2,0,185,46,82,47,21,0,60,42,502,63,32,0,449,56,1288,920,104,110,2962,1070,13266,568,8,30,114,29,19,47,17,3,32,20,6,18,881,68,12,0,67,12,16481,1,3071,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,1340,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,16355,541];var astralIdentifierCodes=[509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,1306,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,52,0,13,2,49,13,16,9,83,11,168,11,6,9,8,2,57,0,2,6,3,1,3,2,10,0,11,1,3,6,4,4,316,19,13,9,214,6,3,8,112,16,16,9,82,12,9,9,535,9,20855,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,4305,6,792618,239]; // This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code,set){var pos=65536;for(var i=0;i<set.length;i+=2){pos+=set[i];if(pos>code){return false;}pos+=set[i+1];if(pos>=code){return true;}}}function isIdentifierStart(code,astral){if(code<65){return code===36;}if(code<91){return true;}if(code<97){return code===95;}if(code<123){return true;}if(code<=65535){return code>=170&&nonASCIIidentifierStart.test(String.fromCharCode(code));}if(astral===false){return false;}return isInAstralSet(code,astralIdentifierStartCodes);}function isIdentifierChar(code,astral){if(code<48){return code===36;}if(code<58){return true;}if(code<65){return false;}if(code<91){return true;}if(code<97){return code===95;}if(code<123){return true;}if(code<=65535){return code>=170&&nonASCIIidentifier.test(String.fromCharCode(code));}if(astral===false){return false;}return isInAstralSet(code,astralIdentifierStartCodes)||isInAstralSet(code,astralIdentifierCodes);}},{}],8:[function(_dereq_,module,exports){"use strict";var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}; // The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.
exports.getLineInfo=getLineInfo;exports.__esModule=true;var Parser=_dereq_("./state").Parser;var lineBreakG=_dereq_("./whitespace").lineBreakG;var deprecate=_dereq_("util").deprecate; // These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.
var Position=exports.Position=function(){function Position(line,col){_classCallCheck(this,Position);this.line=line;this.column=col;}Position.prototype.offset=function offset(n){return new Position(this.line,this.column+n);};return Position;}();var SourceLocation=exports.SourceLocation=function SourceLocation(p,start,end){_classCallCheck(this,SourceLocation);this.start=start;this.end=end;if(p.sourceFile!==null)this.source=p.sourceFile;};function getLineInfo(input,offset){for(var line=1,cur=0;;){lineBreakG.lastIndex=cur;var match=lineBreakG.exec(input);if(match&&match.index<offset){++line;cur=match.index+match[0].length;}else {return new Position(line,offset-cur);}}}var pp=Parser.prototype; // This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.
pp.raise=function(pos,message){var loc=getLineInfo(this.input,pos);message+=" ("+loc.line+":"+loc.column+")";var err=new SyntaxError(message);err.pos=pos;err.loc=loc;err.raisedAt=this.pos;throw err;};pp.curPosition=function(){return new Position(this.curLine,this.pos-this.lineStart);};pp.markPosition=function(){return this.options.locations?[this.start,this.startLoc]:this.start;};},{"./state":13,"./whitespace":19,"util":5}],9:[function(_dereq_,module,exports){"use strict";var tt=_dereq_("./tokentype").types;var Parser=_dereq_("./state").Parser;var reservedWords=_dereq_("./identifier").reservedWords;var has=_dereq_("./util").has;var pp=Parser.prototype; // Convert existing expression atom to assignable pattern
// if possible.
pp.toAssignable=function(node,isBinding){if(this.options.ecmaVersion>=6&&node){switch(node.type){case "Identifier":case "ObjectPattern":case "ArrayPattern":case "AssignmentPattern":break;case "ObjectExpression":node.type="ObjectPattern";for(var i=0;i<node.properties.length;i++){var prop=node.properties[i];if(prop.kind!=="init")this.raise(prop.key.start,"Object pattern can't contain getter or setter");this.toAssignable(prop.value,isBinding);}break;case "ArrayExpression":node.type="ArrayPattern";this.toAssignableList(node.elements,isBinding);break;case "AssignmentExpression":if(node.operator==="="){node.type="AssignmentPattern";}else {this.raise(node.left.end,"Only '=' operator can be used for specifying default value.");}break;case "ParenthesizedExpression":node.expression=this.toAssignable(node.expression,isBinding);break;case "MemberExpression":if(!isBinding)break;default:this.raise(node.start,"Assigning to rvalue");}}return node;}; // Convert list of expression atoms to binding list.
pp.toAssignableList=function(exprList,isBinding){var end=exprList.length;if(end){var last=exprList[end-1];if(last&&last.type=="RestElement"){--end;}else if(last&&last.type=="SpreadElement"){last.type="RestElement";var arg=last.argument;this.toAssignable(arg,isBinding);if(arg.type!=="Identifier"&&arg.type!=="MemberExpression"&&arg.type!=="ArrayPattern")this.unexpected(arg.start);--end;}}for(var i=0;i<end;i++){var elt=exprList[i];if(elt)this.toAssignable(elt,isBinding);}return exprList;}; // Parses spread element.
pp.parseSpread=function(refShorthandDefaultPos){var node=this.startNode();this.next();node.argument=this.parseMaybeAssign(refShorthandDefaultPos);return this.finishNode(node,"SpreadElement");};pp.parseRest=function(){var node=this.startNode();this.next();node.argument=this.type===tt.name||this.type===tt.bracketL?this.parseBindingAtom():this.unexpected();return this.finishNode(node,"RestElement");}; // Parses lvalue (assignable) atom.
pp.parseBindingAtom=function(){if(this.options.ecmaVersion<6)return this.parseIdent();switch(this.type){case tt.name:return this.parseIdent();case tt.bracketL:var node=this.startNode();this.next();node.elements=this.parseBindingList(tt.bracketR,true,true);return this.finishNode(node,"ArrayPattern");case tt.braceL:return this.parseObj(true);default:this.unexpected();}};pp.parseBindingList=function(close,allowEmpty,allowTrailingComma){var elts=[],first=true;while(!this.eat(close)){if(first)first=false;else this.expect(tt.comma);if(allowEmpty&&this.type===tt.comma){elts.push(null);}else if(allowTrailingComma&&this.afterTrailingComma(close)){break;}else if(this.type===tt.ellipsis){var rest=this.parseRest();this.parseBindingListItem(rest);elts.push(rest);this.expect(close);break;}else {var elem=this.parseMaybeDefault(this.start,this.startLoc);this.parseBindingListItem(elem);elts.push(elem);}}return elts;};pp.parseBindingListItem=function(param){return param;}; // Parses assignment pattern around given atom if possible.
pp.parseMaybeDefault=function(startPos,startLoc,left){if(Array.isArray(startPos)){if(this.options.locations&&noCalls===undefined){ // shift arguments to left by one
left=startLoc; // flatten startPos
startLoc=startPos[1];startPos=startPos[0];}}left=left||this.parseBindingAtom();if(!this.eat(tt.eq))return left;var node=this.startNodeAt(startPos,startLoc);node.operator="=";node.left=left;node.right=this.parseMaybeAssign();return this.finishNode(node,"AssignmentPattern");}; // Verify that a node is an lval — something that can be assigned
// to.
pp.checkLVal=function(expr,isBinding,checkClashes){switch(expr.type){case "Identifier":if(this.strict&&(reservedWords.strictBind(expr.name)||reservedWords.strict(expr.name)))this.raise(expr.start,(isBinding?"Binding ":"Assigning to ")+expr.name+" in strict mode");if(checkClashes){if(has(checkClashes,expr.name))this.raise(expr.start,"Argument name clash in strict mode");checkClashes[expr.name]=true;}break;case "MemberExpression":if(isBinding)this.raise(expr.start,(isBinding?"Binding":"Assigning to")+" member expression");break;case "ObjectPattern":for(var i=0;i<expr.properties.length;i++){this.checkLVal(expr.properties[i].value,isBinding,checkClashes);}break;case "ArrayPattern":for(var i=0;i<expr.elements.length;i++){var elem=expr.elements[i];if(elem)this.checkLVal(elem,isBinding,checkClashes);}break;case "AssignmentPattern":this.checkLVal(expr.left,isBinding,checkClashes);break;case "RestElement":this.checkLVal(expr.argument,isBinding,checkClashes);break;case "ParenthesizedExpression":this.checkLVal(expr.expression,isBinding,checkClashes);break;default:this.raise(expr.start,(isBinding?"Binding":"Assigning to")+" rvalue");}};},{"./identifier":7,"./state":13,"./tokentype":17,"./util":18}],10:[function(_dereq_,module,exports){"use strict";var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}};exports.__esModule=true;var Parser=_dereq_("./state").Parser;var SourceLocation=_dereq_("./location").SourceLocation; // Start an AST node, attaching a start offset.
var pp=Parser.prototype;var Node=exports.Node=function Node(){_classCallCheck(this,Node);};pp.startNode=function(){var node=new Node();node.start=this.start;if(this.options.locations)node.loc=new SourceLocation(this,this.startLoc);if(this.options.directSourceFile)node.sourceFile=this.options.directSourceFile;if(this.options.ranges)node.range=[this.start,0];return node;};pp.startNodeAt=function(pos,loc){var node=new Node();if(Array.isArray(pos)){if(this.options.locations&&loc===undefined){ // flatten pos
loc=pos[1];pos=pos[0];}}node.start=pos;if(this.options.locations)node.loc=new SourceLocation(this,loc);if(this.options.directSourceFile)node.sourceFile=this.options.directSourceFile;if(this.options.ranges)node.range=[pos,0];return node;}; // Finish an AST node, adding `type` and `end` properties.
pp.finishNode=function(node,type){node.type=type;node.end=this.lastTokEnd;if(this.options.locations)node.loc.end=this.lastTokEndLoc;if(this.options.ranges)node.range[1]=this.lastTokEnd;return node;}; // Finish node at given position
pp.finishNodeAt=function(node,type,pos,loc){node.type=type;if(Array.isArray(pos)){if(this.options.locations&&loc===undefined){ // flatten pos
loc=pos[1];pos=pos[0];}}node.end=pos;if(this.options.locations)node.loc.end=loc;if(this.options.ranges)node.range[1]=pos;return node;};},{"./location":8,"./state":13}],11:[function(_dereq_,module,exports){ // Interpret and default an options object
"use strict";exports.getOptions=getOptions;exports.__esModule=true;var _util=_dereq_("./util");var has=_util.has;var isArray=_util.isArray;var SourceLocation=_dereq_("./location").SourceLocation; // A second optional argument can be given to further configure
// the parser process. These options are recognized:
var defaultOptions={ // `ecmaVersion` indicates the ECMAScript version to parse. Must
// be either 3, or 5, or 6. This influences support for strict
// mode, the set of reserved words, support for getters and
// setters and other features.
ecmaVersion:5, // Source type ("script" or "module") for different semantics
sourceType:"script", // `onInsertedSemicolon` can be a callback that will be called
// when a semicolon is automatically inserted. It will be passed
// th position of the comma as an offset, and if `locations` is
// enabled, it is given the location as a `{line, column}` object
// as second argument.
onInsertedSemicolon:null, // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
// trailing commas.
onTrailingComma:null, // By default, reserved words are not enforced. Disable
// `allowReserved` to enforce them. When this option has the
// value "never", reserved words and keywords can also not be
// used as property names.
allowReserved:true, // When enabled, a return at the top level is not considered an
// error.
allowReturnOutsideFunction:false, // When enabled, import/export statements are not constrained to
// appearing at the top of the program.
allowImportExportEverywhere:false, // When enabled, hashbang directive in the beginning of file
// is allowed and treated as a line comment.
allowHashBang:false, // When `locations` is on, `loc` properties holding objects with
// `start` and `end` properties in `{line, column}` form (with
// line being 1-based and column 0-based) will be attached to the
// nodes.
locations:false, // A function can be passed as `onToken` option, which will
// cause Acorn to call that function with object in the same
// format as tokenize() returns. Note that you are not
// allowed to call the parser from the callback—that will
// corrupt its internal state.
onToken:null, // A function can be passed as `onComment` option, which will
// cause Acorn to call that function with `(block, text, start,
// end)` parameters whenever a comment is skipped. `block` is a
// boolean indicating whether this is a block (`/* */`) comment,
// `text` is the content of the comment, and `start` and `end` are
// character offsets that denote the start and end of the comment.
// When the `locations` option is on, two more parameters are
// passed, the full `{line, column}` locations of the start and
// end of the comments. Note that you are not allowed to call the
// parser from the callback—that will corrupt its internal state.
onComment:null, // Nodes have their start and end characters offsets recorded in
// `start` and `end` properties (directly on the node, rather than
// the `loc` object, which holds line/column data. To also add a
// [semi-standardized][range] `range` property holding a `[start,
// end]` array with the same numbers, set the `ranges` option to
// `true`.
//
// [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
ranges:false, // It is possible to parse multiple files into a single AST by
// passing the tree produced by parsing the first file as
// `program` option in subsequent parses. This will add the
// toplevel forms of the parsed file to the `Program` (top) node
// of an existing parse tree.
program:null, // When `locations` is on, you can pass this to record the source
// file in every node's `loc` object.
sourceFile:null, // This value, if given, is stored in every node, whether
// `locations` is on or off.
directSourceFile:null, // When enabled, parenthesized expressions are represented by
// (non-standard) ParenthesizedExpression nodes
preserveParens:false,plugins:{}};exports.defaultOptions=defaultOptions;function getOptions(opts){var options={};for(var opt in defaultOptions){options[opt]=opts&&has(opts,opt)?opts[opt]:defaultOptions[opt];}if(isArray(options.onToken)){(function(){var tokens=options.onToken;options.onToken=function(token){return tokens.push(token);};})();}if(isArray(options.onComment))options.onComment=pushComment(options,options.onComment);return options;}function pushComment(options,array){return function(block,text,start,end,startLoc,endLoc){var comment={type:block?"Block":"Line",value:text,start:start,end:end};if(options.locations)comment.loc=new SourceLocation(this,startLoc,endLoc);if(options.ranges)comment.range=[start,end];array.push(comment);};}},{"./location":8,"./util":18}],12:[function(_dereq_,module,exports){"use strict";var tt=_dereq_("./tokentype").types;var Parser=_dereq_("./state").Parser;var lineBreak=_dereq_("./whitespace").lineBreak;var pp=Parser.prototype; // ## Parser utilities
// Test whether a statement node is the string literal `"use strict"`.
pp.isUseStrict=function(stmt){return this.options.ecmaVersion>=5&&stmt.type==="ExpressionStatement"&&stmt.expression.type==="Literal"&&stmt.expression.value==="use strict";}; // Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.
pp.eat=function(type){if(this.type===type){this.next();return true;}else {return false;}}; // Tests whether parsed token is a contextual keyword.
pp.isContextual=function(name){return this.type===tt.name&&this.value===name;}; // Consumes contextual keyword if possible.
pp.eatContextual=function(name){return this.value===name&&this.eat(tt.name);}; // Asserts that following token is given contextual keyword.
pp.expectContextual=function(name){if(!this.eatContextual(name))this.unexpected();}; // Test whether a semicolon can be inserted at the current position.
pp.canInsertSemicolon=function(){return this.type===tt.eof||this.type===tt.braceR||lineBreak.test(this.input.slice(this.lastTokEnd,this.start));};pp.insertSemicolon=function(){if(this.canInsertSemicolon()){if(this.options.onInsertedSemicolon)this.options.onInsertedSemicolon(this.lastTokEnd,this.lastTokEndLoc);return true;}}; // Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.
pp.semicolon=function(){if(!this.eat(tt.semi)&&!this.insertSemicolon())this.unexpected();};pp.afterTrailingComma=function(tokType){if(this.type==tokType){if(this.options.onTrailingComma)this.options.onTrailingComma(this.lastTokStart,this.lastTokStartLoc);this.next();return true;}}; // Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.
pp.expect=function(type){this.eat(type)||this.unexpected();}; // Raise an unexpected token error.
pp.unexpected=function(pos){this.raise(pos!=null?pos:this.start,"Unexpected token");};},{"./state":13,"./tokentype":17,"./whitespace":19}],13:[function(_dereq_,module,exports){"use strict";exports.Parser=Parser;exports.__esModule=true;var _identifier=_dereq_("./identifier");var reservedWords=_identifier.reservedWords;var keywords=_identifier.keywords;var tt=_dereq_("./tokentype").types;var lineBreak=_dereq_("./whitespace").lineBreak;function Parser(options,input,startPos){this.options=options;this.sourceFile=this.options.sourceFile||null;this.isKeyword=keywords[this.options.ecmaVersion>=6?6:5];this.isReservedWord=reservedWords[this.options.ecmaVersion];this.input=input; // Load plugins
this.loadPlugins(this.options.plugins); // Set up token state
// The current position of the tokenizer in the input.
if(startPos){this.pos=startPos;this.lineStart=Math.max(0,this.input.lastIndexOf("\n",startPos));this.curLine=this.input.slice(0,this.lineStart).split(lineBreak).length;}else {this.pos=this.lineStart=0;this.curLine=1;} // Properties of the current token:
// Its type
this.type=tt.eof; // For tokens that include more information than their type, the value
this.value=null; // Its start and end offset
this.start=this.end=this.pos; // And, if locations are used, the {line, column} object
// corresponding to those offsets
this.startLoc=this.endLoc=null; // Position information for the previous token
this.lastTokEndLoc=this.lastTokStartLoc=null;this.lastTokStart=this.lastTokEnd=this.pos; // The context stack is used to superficially track syntactic
// context to predict whether a regular expression is allowed in a
// given position.
this.context=this.initialContext();this.exprAllowed=true; // Figure out if it's a module code.
this.strict=this.inModule=this.options.sourceType==="module"; // Used to signify the start of a potential arrow function
this.potentialArrowAt=-1; // Flags to track whether we are in a function, a generator.
this.inFunction=this.inGenerator=false; // Labels in scope.
this.labels=[]; // If enabled, skip leading hashbang line.
if(this.pos===0&&this.options.allowHashBang&&this.input.slice(0,2)==="#!")this.skipLineComment(2);}Parser.prototype.extend=function(name,f){this[name]=f(this[name]);}; // Registered plugins
var plugins={};exports.plugins=plugins;Parser.prototype.loadPlugins=function(plugins){for(var _name in plugins){var plugin=exports.plugins[_name];if(!plugin)throw new Error("Plugin '"+_name+"' not found");plugin(this,plugins[_name]);}};},{"./identifier":7,"./tokentype":17,"./whitespace":19}],14:[function(_dereq_,module,exports){"use strict";var tt=_dereq_("./tokentype").types;var Parser=_dereq_("./state").Parser;var lineBreak=_dereq_("./whitespace").lineBreak;var pp=Parser.prototype; // ### Statement parsing
// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.
pp.parseTopLevel=function(node){var first=true;if(!node.body)node.body=[];while(this.type!==tt.eof){var stmt=this.parseStatement(true,true);node.body.push(stmt);if(first&&this.isUseStrict(stmt))this.setStrict(true);first=false;}this.next();if(this.options.ecmaVersion>=6){node.sourceType=this.options.sourceType;}return this.finishNode(node,"Program");};var loopLabel={kind:"loop"},switchLabel={kind:"switch"}; // Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.
pp.parseStatement=function(declaration,topLevel){var starttype=this.type,node=this.startNode(); // Most types of statements are recognized by the keyword they
// start with. Many are trivial to parse, some require a bit of
// complexity.
switch(starttype){case tt._break:case tt._continue:return this.parseBreakContinueStatement(node,starttype.keyword);case tt._debugger:return this.parseDebuggerStatement(node);case tt._do:return this.parseDoStatement(node);case tt._for:return this.parseForStatement(node);case tt._function:if(!declaration&&this.options.ecmaVersion>=6)this.unexpected();return this.parseFunctionStatement(node);case tt._class:if(!declaration)this.unexpected();return this.parseClass(node,true);case tt._if:return this.parseIfStatement(node);case tt._return:return this.parseReturnStatement(node);case tt._switch:return this.parseSwitchStatement(node);case tt._throw:return this.parseThrowStatement(node);case tt._try:return this.parseTryStatement(node);case tt._let:case tt._const:if(!declaration)this.unexpected(); // NOTE: falls through to _var
case tt._var:return this.parseVarStatement(node,starttype);case tt._while:return this.parseWhileStatement(node);case tt._with:return this.parseWithStatement(node);case tt.braceL:return this.parseBlock();case tt.semi:return this.parseEmptyStatement(node);case tt._export:case tt._import:if(!this.options.allowImportExportEverywhere){if(!topLevel)this.raise(this.start,"'import' and 'export' may only appear at the top level");if(!this.inModule)this.raise(this.start,"'import' and 'export' may appear only with 'sourceType: module'");}return starttype===tt._import?this.parseImport(node):this.parseExport(node); // If the statement does not start with a statement keyword or a
// brace, it's an ExpressionStatement or LabeledStatement. We
// simply start parsing an expression, and afterwards, if the
// next token is a colon and the expression was a simple
// Identifier node, we switch to interpreting it as a label.
default:var maybeName=this.value,expr=this.parseExpression();if(starttype===tt.name&&expr.type==="Identifier"&&this.eat(tt.colon))return this.parseLabeledStatement(node,maybeName,expr);else return this.parseExpressionStatement(node,expr);}};pp.parseBreakContinueStatement=function(node,keyword){var isBreak=keyword=="break";this.next();if(this.eat(tt.semi)||this.insertSemicolon())node.label=null;else if(this.type!==tt.name)this.unexpected();else {node.label=this.parseIdent();this.semicolon();} // Verify that there is an actual destination to break or
// continue to.
for(var i=0;i<this.labels.length;++i){var lab=this.labels[i];if(node.label==null||lab.name===node.label.name){if(lab.kind!=null&&(isBreak||lab.kind==="loop"))break;if(node.label&&isBreak)break;}}if(i===this.labels.length)this.raise(node.start,"Unsyntactic "+keyword);return this.finishNode(node,isBreak?"BreakStatement":"ContinueStatement");};pp.parseDebuggerStatement=function(node){this.next();this.semicolon();return this.finishNode(node,"DebuggerStatement");};pp.parseDoStatement=function(node){this.next();this.labels.push(loopLabel);node.body=this.parseStatement(false);this.labels.pop();this.expect(tt._while);node.test=this.parseParenExpression();if(this.options.ecmaVersion>=6)this.eat(tt.semi);else this.semicolon();return this.finishNode(node,"DoWhileStatement");}; // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.
pp.parseForStatement=function(node){this.next();this.labels.push(loopLabel);this.expect(tt.parenL);if(this.type===tt.semi)return this.parseFor(node,null);if(this.type===tt._var||this.type===tt._let||this.type===tt._const){var _init=this.startNode(),varKind=this.type;this.next();this.parseVar(_init,true,varKind);this.finishNode(_init,"VariableDeclaration");if((this.type===tt._in||this.options.ecmaVersion>=6&&this.isContextual("of"))&&_init.declarations.length===1&&!(varKind!==tt._var&&_init.declarations[0].init))return this.parseForIn(node,_init);return this.parseFor(node,_init);}var refShorthandDefaultPos={start:0};var init=this.parseExpression(true,refShorthandDefaultPos);if(this.type===tt._in||this.options.ecmaVersion>=6&&this.isContextual("of")){this.toAssignable(init);this.checkLVal(init);return this.parseForIn(node,init);}else if(refShorthandDefaultPos.start){this.unexpected(refShorthandDefaultPos.start);}return this.parseFor(node,init);};pp.parseFunctionStatement=function(node){this.next();return this.parseFunction(node,true);};pp.parseIfStatement=function(node){this.next();node.test=this.parseParenExpression();node.consequent=this.parseStatement(false);node.alternate=this.eat(tt._else)?this.parseStatement(false):null;return this.finishNode(node,"IfStatement");};pp.parseReturnStatement=function(node){if(!this.inFunction&&!this.options.allowReturnOutsideFunction)this.raise(this.start,"'return' outside of function");this.next(); // In `return` (and `break`/`continue`), the keywords with
// optional arguments, we eagerly look for a semicolon or the
// possibility to insert one.
if(this.eat(tt.semi)||this.insertSemicolon())node.argument=null;else {node.argument=this.parseExpression();this.semicolon();}return this.finishNode(node,"ReturnStatement");};pp.parseSwitchStatement=function(node){this.next();node.discriminant=this.parseParenExpression();node.cases=[];this.expect(tt.braceL);this.labels.push(switchLabel); // Statements under must be grouped (by label) in SwitchCase
// nodes. `cur` is used to keep the node that we are currently
// adding statements to.
for(var cur,sawDefault;this.type!=tt.braceR;){if(this.type===tt._case||this.type===tt._default){var isCase=this.type===tt._case;if(cur)this.finishNode(cur,"SwitchCase");node.cases.push(cur=this.startNode());cur.consequent=[];this.next();if(isCase){cur.test=this.parseExpression();}else {if(sawDefault)this.raise(this.lastTokStart,"Multiple default clauses");sawDefault=true;cur.test=null;}this.expect(tt.colon);}else {if(!cur)this.unexpected();cur.consequent.push(this.parseStatement(true));}}if(cur)this.finishNode(cur,"SwitchCase");this.next(); // Closing brace
this.labels.pop();return this.finishNode(node,"SwitchStatement");};pp.parseThrowStatement=function(node){this.next();if(lineBreak.test(this.input.slice(this.lastTokEnd,this.start)))this.raise(this.lastTokEnd,"Illegal newline after throw");node.argument=this.parseExpression();this.semicolon();return this.finishNode(node,"ThrowStatement");}; // Reused empty array added for node fields that are always empty.
var empty=[];pp.parseTryStatement=function(node){this.next();node.block=this.parseBlock();node.handler=null;if(this.type===tt._catch){var clause=this.startNode();this.next();this.expect(tt.parenL);clause.param=this.parseBindingAtom();this.checkLVal(clause.param,true);this.expect(tt.parenR);clause.guard=null;clause.body=this.parseBlock();node.handler=this.finishNode(clause,"CatchClause");}node.guardedHandlers=empty;node.finalizer=this.eat(tt._finally)?this.parseBlock():null;if(!node.handler&&!node.finalizer)this.raise(node.start,"Missing catch or finally clause");return this.finishNode(node,"TryStatement");};pp.parseVarStatement=function(node,kind){this.next();this.parseVar(node,false,kind);this.semicolon();return this.finishNode(node,"VariableDeclaration");};pp.parseWhileStatement=function(node){this.next();node.test=this.parseParenExpression();this.labels.push(loopLabel);node.body=this.parseStatement(false);this.labels.pop();return this.finishNode(node,"WhileStatement");};pp.parseWithStatement=function(node){if(this.strict)this.raise(this.start,"'with' in strict mode");this.next();node.object=this.parseParenExpression();node.body=this.parseStatement(false);return this.finishNode(node,"WithStatement");};pp.parseEmptyStatement=function(node){this.next();return this.finishNode(node,"EmptyStatement");};pp.parseLabeledStatement=function(node,maybeName,expr){for(var i=0;i<this.labels.length;++i){if(this.labels[i].name===maybeName)this.raise(expr.start,"Label '"+maybeName+"' is already declared");}var kind=this.type.isLoop?"loop":this.type===tt._switch?"switch":null;this.labels.push({name:maybeName,kind:kind});node.body=this.parseStatement(true);this.labels.pop();node.label=expr;return this.finishNode(node,"LabeledStatement");};pp.parseExpressionStatement=function(node,expr){node.expression=expr;this.semicolon();return this.finishNode(node,"ExpressionStatement");}; // Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).
pp.parseBlock=function(allowStrict){var node=this.startNode(),first=true,oldStrict=undefined;node.body=[];this.expect(tt.braceL);while(!this.eat(tt.braceR)){var stmt=this.parseStatement(true);node.body.push(stmt);if(first&&allowStrict&&this.isUseStrict(stmt)){oldStrict=this.strict;this.setStrict(this.strict=true);}first=false;}if(oldStrict===false)this.setStrict(false);return this.finishNode(node,"BlockStatement");}; // Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.
pp.parseFor=function(node,init){node.init=init;this.expect(tt.semi);node.test=this.type===tt.semi?null:this.parseExpression();this.expect(tt.semi);node.update=this.type===tt.parenR?null:this.parseExpression();this.expect(tt.parenR);node.body=this.parseStatement(false);this.labels.pop();return this.finishNode(node,"ForStatement");}; // Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.
pp.parseForIn=function(node,init){var type=this.type===tt._in?"ForInStatement":"ForOfStatement";this.next();node.left=init;node.right=this.parseExpression();this.expect(tt.parenR);node.body=this.parseStatement(false);this.labels.pop();return this.finishNode(node,type);}; // Parse a list of variable declarations.
pp.parseVar=function(node,isFor,kind){node.declarations=[];node.kind=kind.keyword;for(;;){var decl=this.startNode();this.parseVarId(decl);if(this.eat(tt.eq)){decl.init=this.parseMaybeAssign(isFor);}else if(kind===tt._const&&!(this.type===tt._in||this.options.ecmaVersion>=6&&this.isContextual("of"))){this.unexpected();}else if(decl.id.type!="Identifier"&&!(isFor&&(this.type===tt._in||this.isContextual("of")))){this.raise(this.lastTokEnd,"Complex binding patterns require an initialization value");}else {decl.init=null;}node.declarations.push(this.finishNode(decl,"VariableDeclarator"));if(!this.eat(tt.comma))break;}return node;};pp.parseVarId=function(decl){decl.id=this.parseBindingAtom();this.checkLVal(decl.id,true);}; // Parse a function declaration or literal (depending on the
// `isStatement` parameter).
pp.parseFunction=function(node,isStatement,allowExpressionBody){this.initFunction(node);if(this.options.ecmaVersion>=6)node.generator=this.eat(tt.star);if(isStatement||this.type===tt.name)node.id=this.parseIdent();this.parseFunctionParams(node);this.parseFunctionBody(node,allowExpressionBody);return this.finishNode(node,isStatement?"FunctionDeclaration":"FunctionExpression");};pp.parseFunctionParams=function(node){this.expect(tt.parenL);node.params=this.parseBindingList(tt.parenR,false,false);}; // Parse a class declaration or literal (depending on the
// `isStatement` parameter).
pp.parseClass=function(node,isStatement){this.next();this.parseClassId(node,isStatement);this.parseClassSuper(node);var classBody=this.startNode();var hadConstructor=false;classBody.body=[];this.expect(tt.braceL);while(!this.eat(tt.braceR)){if(this.eat(tt.semi))continue;var method=this.startNode();var isGenerator=this.eat(tt.star);var isMaybeStatic=this.type===tt.name&&this.value==="static";this.parsePropertyName(method);method["static"]=isMaybeStatic&&this.type!==tt.parenL;if(method["static"]){if(isGenerator)this.unexpected();isGenerator=this.eat(tt.star);this.parsePropertyName(method);}method.kind="method";if(!method.computed){var key=method.key;var isGetSet=false;if(!isGenerator&&key.type==="Identifier"&&this.type!==tt.parenL&&(key.name==="get"||key.name==="set")){isGetSet=true;method.kind=key.name;key=this.parsePropertyName(method);}if(!method["static"]&&(key.type==="Identifier"&&key.name==="constructor"||key.type==="Literal"&&key.value==="constructor")){if(hadConstructor)this.raise(key.start,"Duplicate constructor in the same class");if(isGetSet)this.raise(key.start,"Constructor can't have get/set modifier");if(isGenerator)this.raise(key.start,"Constructor can't be a generator");method.kind="constructor";hadConstructor=true;}}this.parseClassMethod(classBody,method,isGenerator);}node.body=this.finishNode(classBody,"ClassBody");return this.finishNode(node,isStatement?"ClassDeclaration":"ClassExpression");};pp.parseClassMethod=function(classBody,method,isGenerator){method.value=this.parseMethod(isGenerator);classBody.body.push(this.finishNode(method,"MethodDefinition"));};pp.parseClassId=function(node,isStatement){node.id=this.type===tt.name?this.parseIdent():isStatement?this.unexpected():null;};pp.parseClassSuper=function(node){node.superClass=this.eat(tt._extends)?this.parseExprSubscripts():null;}; // Parses module export declaration.
pp.parseExport=function(node){this.next(); // export * from '...'
if(this.eat(tt.star)){this.expectContextual("from");node.source=this.type===tt.string?this.parseExprAtom():this.unexpected();this.semicolon();return this.finishNode(node,"ExportAllDeclaration");}if(this.eat(tt._default)){ // export default ...
var expr=this.parseMaybeAssign();var needsSemi=true;if(expr.type=="FunctionExpression"||expr.type=="ClassExpression"){needsSemi=false;if(expr.id){expr.type=expr.type=="FunctionExpression"?"FunctionDeclaration":"ClassDeclaration";}}node.declaration=expr;if(needsSemi)this.semicolon();return this.finishNode(node,"ExportDefaultDeclaration");} // export var|const|let|function|class ...
if(this.shouldParseExportStatement()){node.declaration=this.parseStatement(true);node.specifiers=[];node.source=null;}else { // export { x, y as z } [from '...']
node.declaration=null;node.specifiers=this.parseExportSpecifiers();if(this.eatContextual("from")){node.source=this.type===tt.string?this.parseExprAtom():this.unexpected();}else {node.source=null;}this.semicolon();}return this.finishNode(node,"ExportNamedDeclaration");};pp.shouldParseExportStatement=function(){return this.type.keyword;}; // Parses a comma-separated list of module exports.
pp.parseExportSpecifiers=function(){var nodes=[],first=true; // export { x, y as z } [from '...']
this.expect(tt.braceL);while(!this.eat(tt.braceR)){if(!first){this.expect(tt.comma);if(this.afterTrailingComma(tt.braceR))break;}else first=false;var node=this.startNode();node.local=this.parseIdent(this.type===tt._default);node.exported=this.eatContextual("as")?this.parseIdent(true):node.local;nodes.push(this.finishNode(node,"ExportSpecifier"));}return nodes;}; // Parses import declaration.
pp.parseImport=function(node){this.next(); // import '...'
if(this.type===tt.string){node.specifiers=empty;node.source=this.parseExprAtom();node.kind="";}else {node.specifiers=this.parseImportSpecifiers();this.expectContextual("from");node.source=this.type===tt.string?this.parseExprAtom():this.unexpected();}this.semicolon();return this.finishNode(node,"ImportDeclaration");}; // Parses a comma-separated list of module imports.
pp.parseImportSpecifiers=function(){var nodes=[],first=true;if(this.type===tt.name){ // import defaultObj, { x, y as z } from '...'
var node=this.startNode();node.local=this.parseIdent();this.checkLVal(node.local,true);nodes.push(this.finishNode(node,"ImportDefaultSpecifier"));if(!this.eat(tt.comma))return nodes;}if(this.type===tt.star){var node=this.startNode();this.next();this.expectContextual("as");node.local=this.parseIdent();this.checkLVal(node.local,true);nodes.push(this.finishNode(node,"ImportNamespaceSpecifier"));return nodes;}this.expect(tt.braceL);while(!this.eat(tt.braceR)){if(!first){this.expect(tt.comma);if(this.afterTrailingComma(tt.braceR))break;}else first=false;var node=this.startNode();node.imported=this.parseIdent(true);node.local=this.eatContextual("as")?this.parseIdent():node.imported;this.checkLVal(node.local,true);nodes.push(this.finishNode(node,"ImportSpecifier"));}return nodes;};},{"./state":13,"./tokentype":17,"./whitespace":19}],15:[function(_dereq_,module,exports){"use strict";var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}};exports.__esModule=true; // The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design
var Parser=_dereq_("./state").Parser;var tt=_dereq_("./tokentype").types;var lineBreak=_dereq_("./whitespace").lineBreak;var TokContext=exports.TokContext=function TokContext(token,isExpr,preserveSpace,override){_classCallCheck(this,TokContext);this.token=token;this.isExpr=isExpr;this.preserveSpace=preserveSpace;this.override=override;};var types={b_stat:new TokContext("{",false),b_expr:new TokContext("{",true),b_tmpl:new TokContext("${",true),p_stat:new TokContext("(",false),p_expr:new TokContext("(",true),q_tmpl:new TokContext("`",true,true,function(p){return p.readTmplToken();}),f_expr:new TokContext("function",true)};exports.types=types;var pp=Parser.prototype;pp.initialContext=function(){return [types.b_stat];};pp.braceIsBlock=function(prevType){var parent=undefined;if(prevType===tt.colon&&(parent=this.curContext()).token=="{")return !parent.isExpr;if(prevType===tt._return)return lineBreak.test(this.input.slice(this.lastTokEnd,this.start));if(prevType===tt._else||prevType===tt.semi||prevType===tt.eof)return true;if(prevType==tt.braceL)return this.curContext()===types.b_stat;return !this.exprAllowed;};pp.updateContext=function(prevType){var update=undefined,type=this.type;if(type.keyword&&prevType==tt.dot)this.exprAllowed=false;else if(update=type.updateContext)update.call(this,prevType);else this.exprAllowed=type.beforeExpr;}; // Token-specific context update code
tt.parenR.updateContext=tt.braceR.updateContext=function(){if(this.context.length==1){this.exprAllowed=true;return;}var out=this.context.pop();if(out===types.b_stat&&this.curContext()===types.f_expr){this.context.pop();this.exprAllowed=false;}else if(out===types.b_tmpl){this.exprAllowed=true;}else {this.exprAllowed=!out.isExpr;}};tt.braceL.updateContext=function(prevType){this.context.push(this.braceIsBlock(prevType)?types.b_stat:types.b_expr);this.exprAllowed=true;};tt.dollarBraceL.updateContext=function(){this.context.push(types.b_tmpl);this.exprAllowed=true;};tt.parenL.updateContext=function(prevType){var statementParens=prevType===tt._if||prevType===tt._for||prevType===tt._with||prevType===tt._while;this.context.push(statementParens?types.p_stat:types.p_expr);this.exprAllowed=true;};tt.incDec.updateContext=function(){};tt._function.updateContext=function(){if(this.curContext()!==types.b_stat)this.context.push(types.f_expr);this.exprAllowed=false;};tt.backQuote.updateContext=function(){if(this.curContext()===types.q_tmpl)this.context.pop();else this.context.push(types.q_tmpl);this.exprAllowed=false;}; // tokExprAllowed stays unchanged
},{"./state":13,"./tokentype":17,"./whitespace":19}],16:[function(_dereq_,module,exports){"use strict";var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}};exports.__esModule=true;var _identifier=_dereq_("./identifier");var isIdentifierStart=_identifier.isIdentifierStart;var isIdentifierChar=_identifier.isIdentifierChar;var _tokentype=_dereq_("./tokentype");var tt=_tokentype.types;var keywordTypes=_tokentype.keywords;var Parser=_dereq_("./state").Parser;var SourceLocation=_dereq_("./location").SourceLocation;var _whitespace=_dereq_("./whitespace");var lineBreak=_whitespace.lineBreak;var lineBreakG=_whitespace.lineBreakG;var isNewLine=_whitespace.isNewLine;var nonASCIIwhitespace=_whitespace.nonASCIIwhitespace; // Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.
var Token=exports.Token=function Token(p){_classCallCheck(this,Token);this.type=p.type;this.value=p.value;this.start=p.start;this.end=p.end;if(p.options.locations)this.loc=new SourceLocation(p,p.startLoc,p.endLoc);if(p.options.ranges)this.range=[p.start,p.end];}; // ## Tokenizer
var pp=Parser.prototype; // Are we running under Rhino?
var isRhino=typeof Packages!=="undefined"; // Move to the next token
pp.next=function(){if(this.options.onToken)this.options.onToken(new Token(this));this.lastTokEnd=this.end;this.lastTokStart=this.start;this.lastTokEndLoc=this.endLoc;this.lastTokStartLoc=this.startLoc;this.nextToken();};pp.getToken=function(){this.next();return new Token(this);}; // If we're in an ES6 environment, make parsers iterable
if(typeof Symbol!=="undefined")pp[Symbol.iterator]=function(){var self=this;return {next:function next(){var token=self.getToken();return {done:token.type===tt.eof,value:token};}};}; // Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).
pp.setStrict=function(strict){this.strict=strict;if(this.type!==tt.num&&this.type!==tt.string)return;this.pos=this.start;if(this.options.locations){while(this.pos<this.lineStart){this.lineStart=this.input.lastIndexOf("\n",this.lineStart-2)+1;--this.curLine;}}this.nextToken();};pp.curContext=function(){return this.context[this.context.length-1];}; // Read a single token, updating the parser object's token-related
// properties.
pp.nextToken=function(){var curContext=this.curContext();if(!curContext||!curContext.preserveSpace)this.skipSpace();this.start=this.pos;if(this.options.locations)this.startLoc=this.curPosition();if(this.pos>=this.input.length)return this.finishToken(tt.eof);if(curContext.override)return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());};pp.readToken=function(code){ // Identifier or keyword. '\uXXXX' sequences are allowed in
// identifiers, so '\' also dispatches to that.
if(isIdentifierStart(code,this.options.ecmaVersion>=6)||code===92 /* '\' */)return this.readWord();return this.getTokenFromCode(code);};pp.fullCharCodeAtPos=function(){var code=this.input.charCodeAt(this.pos);if(code<=55295||code>=57344)return code;var next=this.input.charCodeAt(this.pos+1);return (code<<10)+next-56613888;};pp.skipBlockComment=function(){var startLoc=this.options.onComment&&this.options.locations&&this.curPosition();var start=this.pos,end=this.input.indexOf("*/",this.pos+=2);if(end===-1)this.raise(this.pos-2,"Unterminated comment");this.pos=end+2;if(this.options.locations){lineBreakG.lastIndex=start;var match=undefined;while((match=lineBreakG.exec(this.input))&&match.index<this.pos){++this.curLine;this.lineStart=match.index+match[0].length;}}if(this.options.onComment)this.options.onComment(true,this.input.slice(start+2,end),start,this.pos,startLoc,this.options.locations&&this.curPosition());};pp.skipLineComment=function(startSkip){var start=this.pos;var startLoc=this.options.onComment&&this.options.locations&&this.curPosition();var ch=this.input.charCodeAt(this.pos+=startSkip);while(this.pos<this.input.length&&ch!==10&&ch!==13&&ch!==8232&&ch!==8233){++this.pos;ch=this.input.charCodeAt(this.pos);}if(this.options.onComment)this.options.onComment(false,this.input.slice(start+startSkip,this.pos),start,this.pos,startLoc,this.options.locations&&this.curPosition());}; // Called at the start of the parse and after every token. Skips
// whitespace and comments, and.
pp.skipSpace=function(){while(this.pos<this.input.length){var ch=this.input.charCodeAt(this.pos);if(ch===32){ // ' '
++this.pos;}else if(ch===13){++this.pos;var next=this.input.charCodeAt(this.pos);if(next===10){++this.pos;}if(this.options.locations){++this.curLine;this.lineStart=this.pos;}}else if(ch===10||ch===8232||ch===8233){++this.pos;if(this.options.locations){++this.curLine;this.lineStart=this.pos;}}else if(ch>8&&ch<14){++this.pos;}else if(ch===47){ // '/'
var next=this.input.charCodeAt(this.pos+1);if(next===42){ // '*'
this.skipBlockComment();}else if(next===47){ // '/'
this.skipLineComment(2);}else break;}else if(ch===160){ // '\xa0'
++this.pos;}else if(ch>=5760&&nonASCIIwhitespace.test(String.fromCharCode(ch))){++this.pos;}else {break;}}}; // Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.
pp.finishToken=function(type,val){this.end=this.pos;if(this.options.locations)this.endLoc=this.curPosition();var prevType=this.type;this.type=type;this.value=val;this.updateContext(prevType);}; // ### Token reading
// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot=function(){var next=this.input.charCodeAt(this.pos+1);if(next>=48&&next<=57)return this.readNumber(true);var next2=this.input.charCodeAt(this.pos+2);if(this.options.ecmaVersion>=6&&next===46&&next2===46){ // 46 = dot '.'
this.pos+=3;return this.finishToken(tt.ellipsis);}else {++this.pos;return this.finishToken(tt.dot);}};pp.readToken_slash=function(){ // '/'
var next=this.input.charCodeAt(this.pos+1);if(this.exprAllowed){++this.pos;return this.readRegexp();}if(next===61)return this.finishOp(tt.assign,2);return this.finishOp(tt.slash,1);};pp.readToken_mult_modulo=function(code){ // '%*'
var next=this.input.charCodeAt(this.pos+1);if(next===61)return this.finishOp(tt.assign,2);return this.finishOp(code===42?tt.star:tt.modulo,1);};pp.readToken_pipe_amp=function(code){ // '|&'
var next=this.input.charCodeAt(this.pos+1);if(next===code)return this.finishOp(code===124?tt.logicalOR:tt.logicalAND,2);if(next===61)return this.finishOp(tt.assign,2);return this.finishOp(code===124?tt.bitwiseOR:tt.bitwiseAND,1);};pp.readToken_caret=function(){ // '^'
var next=this.input.charCodeAt(this.pos+1);if(next===61)return this.finishOp(tt.assign,2);return this.finishOp(tt.bitwiseXOR,1);};pp.readToken_plus_min=function(code){ // '+-'
var next=this.input.charCodeAt(this.pos+1);if(next===code){if(next==45&&this.input.charCodeAt(this.pos+2)==62&&lineBreak.test(this.input.slice(this.lastTokEnd,this.pos))){ // A `-->` line comment
this.skipLineComment(3);this.skipSpace();return this.nextToken();}return this.finishOp(tt.incDec,2);}if(next===61)return this.finishOp(tt.assign,2);return this.finishOp(tt.plusMin,1);};pp.readToken_lt_gt=function(code){ // '<>'
var next=this.input.charCodeAt(this.pos+1);var size=1;if(next===code){size=code===62&&this.input.charCodeAt(this.pos+2)===62?3:2;if(this.input.charCodeAt(this.pos+size)===61)return this.finishOp(tt.assign,size+1);return this.finishOp(tt.bitShift,size);}if(next==33&&code==60&&this.input.charCodeAt(this.pos+2)==45&&this.input.charCodeAt(this.pos+3)==45){if(this.inModule)this.unexpected(); // `<!--`, an XML-style comment that should be interpreted as a line comment
this.skipLineComment(4);this.skipSpace();return this.nextToken();}if(next===61)size=this.input.charCodeAt(this.pos+2)===61?3:2;return this.finishOp(tt.relational,size);};pp.readToken_eq_excl=function(code){ // '=!'
var next=this.input.charCodeAt(this.pos+1);if(next===61)return this.finishOp(tt.equality,this.input.charCodeAt(this.pos+2)===61?3:2);if(code===61&&next===62&&this.options.ecmaVersion>=6){ // '=>'
this.pos+=2;return this.finishToken(tt.arrow);}return this.finishOp(code===61?tt.eq:tt.prefix,1);};pp.getTokenFromCode=function(code){switch(code){ // The interpretation of a dot depends on whether it is followed
// by a digit or another two dots.
case 46: // '.'
return this.readToken_dot(); // Punctuation tokens.
case 40:++this.pos;return this.finishToken(tt.parenL);case 41:++this.pos;return this.finishToken(tt.parenR);case 59:++this.pos;return this.finishToken(tt.semi);case 44:++this.pos;return this.finishToken(tt.comma);case 91:++this.pos;return this.finishToken(tt.bracketL);case 93:++this.pos;return this.finishToken(tt.bracketR);case 123:++this.pos;return this.finishToken(tt.braceL);case 125:++this.pos;return this.finishToken(tt.braceR);case 58:++this.pos;return this.finishToken(tt.colon);case 63:++this.pos;return this.finishToken(tt.question);case 96: // '`'
if(this.options.ecmaVersion<6)break;++this.pos;return this.finishToken(tt.backQuote);case 48: // '0'
var next=this.input.charCodeAt(this.pos+1);if(next===120||next===88)return this.readRadixNumber(16); // '0x', '0X' - hex number
if(this.options.ecmaVersion>=6){if(next===111||next===79)return this.readRadixNumber(8); // '0o', '0O' - octal number
if(next===98||next===66)return this.readRadixNumber(2); // '0b', '0B' - binary number
} // Anything else beginning with a digit is an integer, octal
// number, or float.
case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57: // 1-9
return this.readNumber(false); // Quotes produce strings.
case 34:case 39: // '"', "'"
return this.readString(code); // Operators are parsed inline in tiny state machines. '=' (61) is
// often referred to. `finishOp` simply skips the amount of
// characters it is given as second argument, and returns a token
// of the type given by its first argument.
case 47: // '/'
return this.readToken_slash();case 37:case 42: // '%*'
return this.readToken_mult_modulo(code);case 124:case 38: // '|&'
return this.readToken_pipe_amp(code);case 94: // '^'
return this.readToken_caret();case 43:case 45: // '+-'
return this.readToken_plus_min(code);case 60:case 62: // '<>'
return this.readToken_lt_gt(code);case 61:case 33: // '=!'
return this.readToken_eq_excl(code);case 126: // '~'
return this.finishOp(tt.prefix,1);}this.raise(this.pos,"Unexpected character '"+codePointToString(code)+"'");};pp.finishOp=function(type,size){var str=this.input.slice(this.pos,this.pos+size);this.pos+=size;return this.finishToken(type,str);};var regexpUnicodeSupport=false;try{new RegExp("￿","u");regexpUnicodeSupport=true;}catch(e){} // Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.
pp.readRegexp=function(){var escaped=undefined,inClass=undefined,start=this.pos;for(;;){if(this.pos>=this.input.length)this.raise(start,"Unterminated regular expression");var ch=this.input.charAt(this.pos);if(lineBreak.test(ch))this.raise(start,"Unterminated regular expression");if(!escaped){if(ch==="[")inClass=true;else if(ch==="]"&&inClass)inClass=false;else if(ch==="/"&&!inClass)break;escaped=ch==="\\";}else escaped=false;++this.pos;}var content=this.input.slice(start,this.pos);++this.pos; // Need to use `readWord1` because '\uXXXX' sequences are allowed
// here (don't ask).
var mods=this.readWord1();var tmp=content;if(mods){var validFlags=/^[gmsiy]*$/;if(this.options.ecmaVersion>=6)validFlags=/^[gmsiyu]*$/;if(!validFlags.test(mods))this.raise(start,"Invalid regular expression flag");if(mods.indexOf("u")>=0&&!regexpUnicodeSupport){ // Replace each astral symbol and every Unicode escape sequence that
// possibly represents an astral symbol or a paired surrogate with a
// single ASCII symbol to avoid throwing on regular expressions that
// are only valid in combination with the `/u` flag.
// Note: replacing with the ASCII symbol `x` might cause false
// negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
// perfectly valid pattern that is equivalent to `[a-b]`, but it would
// be replaced by `[x-b]` which throws an error.
tmp=tmp.replace(/\\u([a-fA-F0-9]{4})|\\u\{([0-9a-fA-F]+)\}|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,"x");}} // Detect invalid regular expressions.
var value=null; // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
// so don't do detection if we are running under Rhino
if(!isRhino){try{new RegExp(tmp);}catch(e){if(e instanceof SyntaxError)this.raise(start,"Error parsing regular expression: "+e.message);this.raise(e);} // Get a regular expression object for this pattern-flag pair, or `null` in
// case the current environment doesn't support the flags it uses.
try{value=new RegExp(content,mods);}catch(err){}}return this.finishToken(tt.regexp,{pattern:content,flags:mods,value:value});}; // Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.
pp.readInt=function(radix,len){var start=this.pos,total=0;for(var i=0,e=len==null?Infinity:len;i<e;++i){var code=this.input.charCodeAt(this.pos),val=undefined;if(code>=97)val=code-97+10; // a
else if(code>=65)val=code-65+10; // A
else if(code>=48&&code<=57)val=code-48; // 0-9
else val=Infinity;if(val>=radix)break;++this.pos;total=total*radix+val;}if(this.pos===start||len!=null&&this.pos-start!==len)return null;return total;};pp.readRadixNumber=function(radix){this.pos+=2; // 0x
var val=this.readInt(radix);if(val==null)this.raise(this.start+2,"Expected number in radix "+radix);if(isIdentifierStart(this.fullCharCodeAtPos()))this.raise(this.pos,"Identifier directly after number");return this.finishToken(tt.num,val);}; // Read an integer, octal integer, or floating-point number.
pp.readNumber=function(startsWithDot){var start=this.pos,isFloat=false,octal=this.input.charCodeAt(this.pos)===48;if(!startsWithDot&&this.readInt(10)===null)this.raise(start,"Invalid number");if(this.input.charCodeAt(this.pos)===46){++this.pos;this.readInt(10);isFloat=true;}var next=this.input.charCodeAt(this.pos);if(next===69||next===101){ // 'eE'
next=this.input.charCodeAt(++this.pos);if(next===43||next===45)++this.pos; // '+-'
if(this.readInt(10)===null)this.raise(start,"Invalid number");isFloat=true;}if(isIdentifierStart(this.fullCharCodeAtPos()))this.raise(this.pos,"Identifier directly after number");var str=this.input.slice(start,this.pos),val=undefined;if(isFloat)val=parseFloat(str);else if(!octal||str.length===1)val=parseInt(str,10);else if(/[89]/.test(str)||this.strict)this.raise(start,"Invalid number");else val=parseInt(str,8);return this.finishToken(tt.num,val);}; // Read a string value, interpreting backslash-escapes.
pp.readCodePoint=function(){var ch=this.input.charCodeAt(this.pos),code=undefined;if(ch===123){if(this.options.ecmaVersion<6)this.unexpected();++this.pos;code=this.readHexChar(this.input.indexOf("}",this.pos)-this.pos);++this.pos;if(code>1114111)this.unexpected();}else {code=this.readHexChar(4);}return code;};function codePointToString(code){ // UTF-16 Decoding
if(code<=65535){return String.fromCharCode(code);}return String.fromCharCode((code-65536>>10)+55296,(code-65536&1023)+56320);}pp.readString=function(quote){var out="",chunkStart=++this.pos;for(;;){if(this.pos>=this.input.length)this.raise(this.start,"Unterminated string constant");var ch=this.input.charCodeAt(this.pos);if(ch===quote)break;if(ch===92){ // '\'
out+=this.input.slice(chunkStart,this.pos);out+=this.readEscapedChar();chunkStart=this.pos;}else {if(isNewLine(ch))this.raise(this.start,"Unterminated string constant");++this.pos;}}out+=this.input.slice(chunkStart,this.pos++);return this.finishToken(tt.string,out);}; // Reads template string tokens.
pp.readTmplToken=function(){var out="",chunkStart=this.pos;for(;;){if(this.pos>=this.input.length)this.raise(this.start,"Unterminated template");var ch=this.input.charCodeAt(this.pos);if(ch===96||ch===36&&this.input.charCodeAt(this.pos+1)===123){ // '`', '${'
if(this.pos===this.start&&this.type===tt.template){if(ch===36){this.pos+=2;return this.finishToken(tt.dollarBraceL);}else {++this.pos;return this.finishToken(tt.backQuote);}}out+=this.input.slice(chunkStart,this.pos);return this.finishToken(tt.template,out);}if(ch===92){ // '\'
out+=this.input.slice(chunkStart,this.pos);out+=this.readEscapedChar();chunkStart=this.pos;}else if(isNewLine(ch)){out+=this.input.slice(chunkStart,this.pos);++this.pos;if(ch===13&&this.input.charCodeAt(this.pos)===10){++this.pos;out+="\n";}else {out+=String.fromCharCode(ch);}if(this.options.locations){++this.curLine;this.lineStart=this.pos;}chunkStart=this.pos;}else {++this.pos;}}}; // Used to read escaped characters
pp.readEscapedChar=function(){var ch=this.input.charCodeAt(++this.pos);var octal=/^[0-7]+/.exec(this.input.slice(this.pos,this.pos+3));if(octal)octal=octal[0];while(octal&&parseInt(octal,8)>255){octal=octal.slice(0,-1);}if(octal==="0")octal=null;++this.pos;if(octal){if(this.strict)this.raise(this.pos-2,"Octal literal in strict mode");this.pos+=octal.length-1;return String.fromCharCode(parseInt(octal,8));}else {switch(ch){case 110:return "\n"; // 'n' -> '\n'
case 114:return "\r"; // 'r' -> '\r'
case 120:return String.fromCharCode(this.readHexChar(2)); // 'x'
case 117:return codePointToString(this.readCodePoint()); // 'u'
case 116:return "\t"; // 't' -> '\t'
case 98:return "\b"; // 'b' -> '\b'
case 118:return "\u000b"; // 'v' -> '\u000b'
case 102:return "\f"; // 'f' -> '\f'
case 48:return "\u0000"; // 0 -> '\0'
case 13:if(this.input.charCodeAt(this.pos)===10)++this.pos; // '\r\n'
case 10: // ' \n'
if(this.options.locations){this.lineStart=this.pos;++this.curLine;}return "";default:return String.fromCharCode(ch);}}}; // Used to read character escape sequences ('\x', '\u', '\U').
pp.readHexChar=function(len){var n=this.readInt(16,len);if(n===null)this.raise(this.start,"Bad character escape sequence");return n;}; // Used to signal to callers of `readWord1` whether the word
// contained any escape sequences. This is needed because words with
// escape sequences must not be interpreted as keywords.
var containsEsc; // Read an identifier, and return it as a string. Sets `containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.
pp.readWord1=function(){containsEsc=false;var word="",first=true,chunkStart=this.pos;var astral=this.options.ecmaVersion>=6;while(this.pos<this.input.length){var ch=this.fullCharCodeAtPos();if(isIdentifierChar(ch,astral)){this.pos+=ch<=65535?1:2;}else if(ch===92){ // "\"
containsEsc=true;word+=this.input.slice(chunkStart,this.pos);var escStart=this.pos;if(this.input.charCodeAt(++this.pos)!=117) // "u"
this.raise(this.pos,"Expecting Unicode escape sequence \\uXXXX");++this.pos;var esc=this.readCodePoint();if(!(first?isIdentifierStart:isIdentifierChar)(esc,astral))this.raise(escStart,"Invalid Unicode escape");word+=codePointToString(esc);chunkStart=this.pos;}else {break;}first=false;}return word+this.input.slice(chunkStart,this.pos);}; // Read an identifier or keyword token. Will check for reserved
// words when necessary.
pp.readWord=function(){var word=this.readWord1();var type=tt.name;if((this.options.ecmaVersion>=6||!containsEsc)&&this.isKeyword(word))type=keywordTypes[word];return this.finishToken(type,word);};},{"./identifier":7,"./location":8,"./state":13,"./tokentype":17,"./whitespace":19}],17:[function(_dereq_,module,exports){"use strict";var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}};exports.__esModule=true; // ## Token types
// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.
// All token type variables start with an underscore, to make them
// easy to recognize.
// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.
var TokenType=exports.TokenType=function TokenType(label){var conf=arguments[1]===undefined?{}:arguments[1];_classCallCheck(this,TokenType);this.label=label;this.keyword=conf.keyword;this.beforeExpr=!!conf.beforeExpr;this.startsExpr=!!conf.startsExpr;this.isLoop=!!conf.isLoop;this.isAssign=!!conf.isAssign;this.prefix=!!conf.prefix;this.postfix=!!conf.postfix;this.binop=conf.binop||null;this.updateContext=null;};function binop(name,prec){return new TokenType(name,{beforeExpr:true,binop:prec});}var beforeExpr={beforeExpr:true},startsExpr={startsExpr:true};var types={num:new TokenType("num",startsExpr),regexp:new TokenType("regexp",startsExpr),string:new TokenType("string",startsExpr),name:new TokenType("name",startsExpr),eof:new TokenType("eof"), // Punctuation token types.
bracketL:new TokenType("[",{beforeExpr:true,startsExpr:true}),bracketR:new TokenType("]"),braceL:new TokenType("{",{beforeExpr:true,startsExpr:true}),braceR:new TokenType("}"),parenL:new TokenType("(",{beforeExpr:true,startsExpr:true}),parenR:new TokenType(")"),comma:new TokenType(",",beforeExpr),semi:new TokenType(";",beforeExpr),colon:new TokenType(":",beforeExpr),dot:new TokenType("."),question:new TokenType("?",beforeExpr),arrow:new TokenType("=>",beforeExpr),template:new TokenType("template"),ellipsis:new TokenType("...",beforeExpr),backQuote:new TokenType("`",startsExpr),dollarBraceL:new TokenType("${",{beforeExpr:true,startsExpr:true}), // Operators. These carry several kinds of properties to help the
// parser use them properly (the presence of these properties is
// what categorizes them as operators).
//
// `binop`, when present, specifies that this operator is a binary
// operator, and will refer to its precedence.
//
// `prefix` and `postfix` mark the operator as a prefix or postfix
// unary operator.
//
// `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
// binary operators with a very low precedence, that should result
// in AssignmentExpression nodes.
eq:new TokenType("=",{beforeExpr:true,isAssign:true}),assign:new TokenType("_=",{beforeExpr:true,isAssign:true}),incDec:new TokenType("++/--",{prefix:true,postfix:true,startsExpr:true}),prefix:new TokenType("prefix",{beforeExpr:true,prefix:true,startsExpr:true}),logicalOR:binop("||",1),logicalAND:binop("&&",2),bitwiseOR:binop("|",3),bitwiseXOR:binop("^",4),bitwiseAND:binop("&",5),equality:binop("==/!=",6),relational:binop("</>",7),bitShift:binop("<</>>",8),plusMin:new TokenType("+/-",{beforeExpr:true,binop:9,prefix:true,startsExpr:true}),modulo:binop("%",10),star:binop("*",10),slash:binop("/",10)};exports.types=types; // Map keyword names to token types.
var keywords={};exports.keywords=keywords; // Succinct definitions of keyword token types
function kw(name){var options=arguments[1]===undefined?{}:arguments[1];options.keyword=name;keywords[name]=types["_"+name]=new TokenType(name,options);}kw("break");kw("case",beforeExpr);kw("catch");kw("continue");kw("debugger");kw("default");kw("do",{isLoop:true});kw("else",beforeExpr);kw("finally");kw("for",{isLoop:true});kw("function",startsExpr);kw("if");kw("return",beforeExpr);kw("switch");kw("throw",beforeExpr);kw("try");kw("var");kw("let");kw("const");kw("while",{isLoop:true});kw("with");kw("new",{beforeExpr:true,startsExpr:true});kw("this",startsExpr);kw("super",startsExpr);kw("class");kw("extends",beforeExpr);kw("export");kw("import");kw("yield",{beforeExpr:true,startsExpr:true});kw("null",startsExpr);kw("true",startsExpr);kw("false",startsExpr);kw("in",{beforeExpr:true,binop:7});kw("instanceof",{beforeExpr:true,binop:7});kw("typeof",{beforeExpr:true,prefix:true,startsExpr:true});kw("void",{beforeExpr:true,prefix:true,startsExpr:true});kw("delete",{beforeExpr:true,prefix:true,startsExpr:true});},{}],18:[function(_dereq_,module,exports){"use strict";exports.isArray=isArray; // Checks if an object has a property.
exports.has=has;exports.__esModule=true;function isArray(obj){return Object.prototype.toString.call(obj)==="[object Array]";}function has(obj,propName){return Object.prototype.hasOwnProperty.call(obj,propName);}},{}],19:[function(_dereq_,module,exports){"use strict";exports.isNewLine=isNewLine;exports.__esModule=true; // Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.
var lineBreak=/\r\n?|\n|\u2028|\u2029/;exports.lineBreak=lineBreak;var lineBreakG=new RegExp(lineBreak.source,"g");exports.lineBreakG=lineBreakG;function isNewLine(code){return code===10||code===13||code===8232||code==8233;}var nonASCIIwhitespace=/[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;exports.nonASCIIwhitespace=nonASCIIwhitespace;},{}]},{},[1])(1);});}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],48:[function(require,module,exports){(function(global){(function(f){if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else {var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else {g=this;}(g.acorn||(g.acorn={})).walk=f();}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;}({1:[function(_dereq_,module,exports){"use strict";var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}; // AST walker module for Mozilla Parser API compatible trees
// A simple walk is one where you simply specify callbacks to be
// called on specific nodes. The last two arguments are optional. A
// simple use would be
//
//     walk.simple(myTree, {
//         Expression: function(node) { ... }
//     });
//
// to do something with all expressions. All Parser API node types
// can be used to identify node types, as well as Expression,
// Statement, and ScopeBody, which denote categories of nodes.
//
// The base argument can be used to pass a custom (recursive)
// walker, and state can be used to give this walked an initial
// state.
exports.simple=simple; // An ancestor walk builds up an array of ancestor nodes (including
// the current node) and passes them to the callback as the state parameter.
exports.ancestor=ancestor; // A recursive walk is one where your functions override the default
// walkers. They can modify and replace the state parameter that's
// threaded through the walk, and can opt how and whether to walk
// their child nodes (by calling their third argument on these
// nodes).
exports.recursive=recursive; // Find a node with a given start, end, and type (all are optional,
// null can be used as wildcard). Returns a {node, state} object, or
// undefined when it doesn't find a matching node.
exports.findNodeAt=findNodeAt; // Find the innermost node of a given type that contains the given
// position. Interface similar to findNodeAt.
exports.findNodeAround=findNodeAround; // Find the outermost matching node after a given position.
exports.findNodeAfter=findNodeAfter; // Find the outermost matching node before a given position.
exports.findNodeBefore=findNodeBefore; // Used to create a custom walker. Will fill in all missing node
// type properties with the defaults.
exports.make=make;exports.__esModule=true;function simple(node,visitors,base,state){if(!base)base=exports.base;(function c(node,st,override){var type=override||node.type,found=visitors[type];base[type](node,st,c);if(found)found(node,st);})(node,state);}function ancestor(node,visitors,base,state){if(!base)base=exports.base;if(!state)state=[];(function c(node,st,override){var type=override||node.type,found=visitors[type];if(node!=st[st.length-1]){st=st.slice();st.push(node);}base[type](node,st,c);if(found)found(node,st);})(node,state);}function recursive(node,state,funcs,base){var visitor=funcs?exports.make(funcs,base):base;(function c(node,st,override){visitor[override||node.type](node,st,c);})(node,state);}function makeTest(test){if(typeof test=="string"){return function(type){return type==test;};}else if(!test){return function(){return true;};}else {return test;}}var Found=function Found(node,state){_classCallCheck(this,Found);this.node=node;this.state=state;};function findNodeAt(node,start,end,test,base,state){test=makeTest(test);if(!base)base=exports.base;try{;(function c(node,st,override){var type=override||node.type;if((start==null||node.start<=start)&&(end==null||node.end>=end))base[type](node,st,c);if(test(type,node)&&(start==null||node.start==start)&&(end==null||node.end==end))throw new Found(node,st);})(node,state);}catch(e){if(e instanceof Found){return e;}throw e;}}function findNodeAround(node,pos,test,base,state){test=makeTest(test);if(!base)base=exports.base;try{;(function c(node,st,override){var type=override||node.type;if(node.start>pos||node.end<pos){return;}base[type](node,st,c);if(test(type,node))throw new Found(node,st);})(node,state);}catch(e){if(e instanceof Found){return e;}throw e;}}function findNodeAfter(node,pos,test,base,state){test=makeTest(test);if(!base)base=exports.base;try{;(function c(node,st,override){if(node.end<pos){return;}var type=override||node.type;if(node.start>=pos&&test(type,node))throw new Found(node,st);base[type](node,st,c);})(node,state);}catch(e){if(e instanceof Found){return e;}throw e;}}function findNodeBefore(node,pos,test,base,state){test=makeTest(test);if(!base)base=exports.base;var max=undefined;(function c(node,st,override){if(node.start>pos){return;}var type=override||node.type;if(node.end<=pos&&(!max||max.node.end<node.end)&&test(type,node))max=new Found(node,st);base[type](node,st,c);})(node,state);return max;}function make(funcs,base){if(!base)base=exports.base;var visitor={};for(var type in base){visitor[type]=base[type];}for(var type in funcs){visitor[type]=funcs[type];}return visitor;}function skipThrough(node,st,c){c(node,st);}function ignore(_node,_st,_c){} // Node walkers.
var base={};exports.base=base;base.Program=base.BlockStatement=function(node,st,c){for(var i=0;i<node.body.length;++i){c(node.body[i],st,"Statement");}};base.Statement=skipThrough;base.EmptyStatement=ignore;base.ExpressionStatement=base.ParenthesizedExpression=function(node,st,c){return c(node.expression,st,"Expression");};base.IfStatement=function(node,st,c){c(node.test,st,"Expression");c(node.consequent,st,"Statement");if(node.alternate)c(node.alternate,st,"Statement");};base.LabeledStatement=function(node,st,c){return c(node.body,st,"Statement");};base.BreakStatement=base.ContinueStatement=ignore;base.WithStatement=function(node,st,c){c(node.object,st,"Expression");c(node.body,st,"Statement");};base.SwitchStatement=function(node,st,c){c(node.discriminant,st,"Expression");for(var i=0;i<node.cases.length;++i){var cs=node.cases[i];if(cs.test)c(cs.test,st,"Expression");for(var j=0;j<cs.consequent.length;++j){c(cs.consequent[j],st,"Statement");}}};base.ReturnStatement=base.YieldExpression=function(node,st,c){if(node.argument)c(node.argument,st,"Expression");};base.ThrowStatement=base.SpreadElement=base.RestElement=function(node,st,c){return c(node.argument,st,"Expression");};base.TryStatement=function(node,st,c){c(node.block,st,"Statement");if(node.handler)c(node.handler.body,st,"ScopeBody");if(node.finalizer)c(node.finalizer,st,"Statement");};base.WhileStatement=base.DoWhileStatement=function(node,st,c){c(node.test,st,"Expression");c(node.body,st,"Statement");};base.ForStatement=function(node,st,c){if(node.init)c(node.init,st,"ForInit");if(node.test)c(node.test,st,"Expression");if(node.update)c(node.update,st,"Expression");c(node.body,st,"Statement");};base.ForInStatement=base.ForOfStatement=function(node,st,c){c(node.left,st,"ForInit");c(node.right,st,"Expression");c(node.body,st,"Statement");};base.ForInit=function(node,st,c){if(node.type=="VariableDeclaration")c(node,st);else c(node,st,"Expression");};base.DebuggerStatement=ignore;base.FunctionDeclaration=function(node,st,c){return c(node,st,"Function");};base.VariableDeclaration=function(node,st,c){for(var i=0;i<node.declarations.length;++i){var decl=node.declarations[i];if(decl.init)c(decl.init,st,"Expression");}};base.Function=function(node,st,c){return c(node.body,st,"ScopeBody");};base.ScopeBody=function(node,st,c){return c(node,st,"Statement");};base.Expression=skipThrough;base.ThisExpression=base.Super=base.MetaProperty=ignore;base.ArrayExpression=base.ArrayPattern=function(node,st,c){for(var i=0;i<node.elements.length;++i){var elt=node.elements[i];if(elt)c(elt,st,"Expression");}};base.ObjectExpression=base.ObjectPattern=function(node,st,c){for(var i=0;i<node.properties.length;++i){c(node.properties[i],st);}};base.FunctionExpression=base.ArrowFunctionExpression=base.FunctionDeclaration;base.SequenceExpression=base.TemplateLiteral=function(node,st,c){for(var i=0;i<node.expressions.length;++i){c(node.expressions[i],st,"Expression");}};base.UnaryExpression=base.UpdateExpression=function(node,st,c){c(node.argument,st,"Expression");};base.BinaryExpression=base.AssignmentExpression=base.AssignmentPattern=base.LogicalExpression=function(node,st,c){c(node.left,st,"Expression");c(node.right,st,"Expression");};base.ConditionalExpression=function(node,st,c){c(node.test,st,"Expression");c(node.consequent,st,"Expression");c(node.alternate,st,"Expression");};base.NewExpression=base.CallExpression=function(node,st,c){c(node.callee,st,"Expression");if(node.arguments)for(var i=0;i<node.arguments.length;++i){c(node.arguments[i],st,"Expression");}};base.MemberExpression=function(node,st,c){c(node.object,st,"Expression");if(node.computed)c(node.property,st,"Expression");};base.ExportNamedDeclaration=base.ExportDefaultDeclaration=function(node,st,c){return c(node.declaration,st);};base.ImportDeclaration=function(node,st,c){for(var i=0;i<node.specifiers.length;i++){c(node.specifiers[i],st);}};base.ImportSpecifier=base.ImportDefaultSpecifier=base.ImportNamespaceSpecifier=base.Identifier=base.Literal=ignore;base.TaggedTemplateExpression=function(node,st,c){c(node.tag,st,"Expression");c(node.quasi,st);};base.ClassDeclaration=base.ClassExpression=function(node,st,c){if(node.superClass)c(node.superClass,st,"Expression");for(var i=0;i<node.body.body.length;i++){c(node.body.body[i],st);}};base.MethodDefinition=base.Property=function(node,st,c){if(node.computed)c(node.key,st,"Expression");c(node.value,st,"Expression");};base.ComprehensionExpression=function(node,st,c){for(var i=0;i<node.blocks.length;i++){c(node.blocks[i].right,st,"Expression");}c(node.body,st,"Expression");};},{}]},{},[1])(1);});}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],49:[function(require,module,exports){'use strict'; // Libraries
require('exomon');var jade=require('jade'); // Views
var NavbarMain=require('./views/NavbarMain');var JSONEditor=require('./views/JSONEditor');var PageEditor=require('./views/PageEditor');var SchemaEditor=require('./views/SchemaEditor');var MediaViewer=require('./views/MediaViewer'); // Helper function
require('./helpers'); // -----------
// Ready functions
// -----------
var onReadyCallbacks=[];function onReady(callback){onReadyCallbacks.push(callback);}function checkReady(){if(resourcesLoaded>=resourcesRequired){for(var i in onReadyCallbacks){onReadyCallbacks[i]();}}} // -----------
// Preload resources 
// -----------
// TODO: Use a queue instead of this horribleness
var resourcesRequired=4;var resourcesLoaded=0;window.reloadResource=function reloadResource(name,callback){$.getJSON('/api/'+name,function(result){window.resources[name]=result;callback(result);});};window.resources={editors:[]};$.getJSON('/api/pages',function(pages){window.resources.pages=pages;resourcesLoaded++;checkReady();});$.getJSON('/api/sections',function(sections){window.resources.sections=sections;resourcesLoaded++;checkReady();});$.getJSON('/api/schemas',function(schemas){window.resources.schemas=schemas;resourcesLoaded++;checkReady();});$.getJSON('/api/media',function(media){window.resources.media=media;resourcesLoaded++;checkReady();}); // -----------
// Routes
// -----------
// Page dashboard
Router.route('/pages/',function(){ViewHelper.get('NavbarMain').showTab('/pages/');$('.workspace').html(_.div({class:'dashboard-container'},[_.h1('Pages dashboard'),_.p('Please click on a page to proceed')]));}); // Page edit
Router.route('/pages/:id',function(){var pageEditor=new PageEditor({modelUrl:'/api/pages/'+this.id});ViewHelper.get('NavbarMain').highlightItem(this.id);$('.workspace').html(pageEditor.$element);}); // Page edit (JSON editor)
Router.route('/pages/json/:id',function(){var pageEditor=new JSONEditor({modelUrl:'/api/pages/'+this.id});ViewHelper.get('NavbarMain').highlightItem(this.id);$('.workspace').html(pageEditor.$element);}); // Schema edit
Router.route('/schemas/:id',function(){var schemaEditor=new SchemaEditor({modelUrl:'/api/schemas/'+this.id});ViewHelper.get('NavbarMain').highlightItem(this.id);$('.workspace').html(schemaEditor.$element);}); // Schema edit (JSON editor)
Router.route('/schemas/json/:id',function(){var jsonEditor=new JSONEditor({modelUrl:'/api/schemas/'+this.id});ViewHelper.get('NavbarMain').highlightItem(this.id);$('.workspace').html(jsonEditor.$element);}); // Media preview
Router.route('/media/:id',function(){var mediaViewer=new MediaViewer({mediaId:this.id});ViewHelper.get('NavbarMain').highlightItem(this.id);$('.workspace').html(mediaViewer.$element);}); // Media dashboard
Router.route('/media/',function(){ViewHelper.get('NavbarMain').showTab('/media/');$('.workspace').html(_.div({class:'dashboard-container'},[_.h1('Media dashboard'),_.p('Please click on a media object to proceed')]));}); // ----------
// Init
// ----------
onReady(function(){new NavbarMain();Router.init();});},{"./helpers":50,"./views/JSONEditor":52,"./views/MediaViewer":53,"./views/NavbarMain":55,"./views/PageEditor":56,"./views/SchemaEditor":57,"exomon":11,"jade":16}],50:[function(require,module,exports){ /**
 * Gets a schema with parent included recursively
 *
 * @param {Number} id
 *
 * @return {Object} schema
 */window.getSchemaWithParents=function getSchemaWithParents(id){var schema=$.extend(true,{},resources.schemas[id]);if(schema){ // Merge parent with current schema
// Since the child schema should override any duplicate content,
// the parent is transformed first, then returned as the resulting schema
if(schema.parentSchemaId){var parentSchema=window.getSchemaWithParents(schema.parentSchemaId);for(var k in schema.properties){parentSchema.properties[k]=schema.properties[k];}for(var _k in schema.tabs){parentSchema.tabs[_k]=schema.tabs[_k];}parentSchema.defaultTabId=schema.defaultTabId;parentSchema.icon=schema.icon;schema=parentSchema;}}else {console.log('No schema with id "'+id+'" available in resources');}return schema;};},{}],51:[function(require,module,exports){module.exports={"icons":["500px","adjust","adn","align-center","align-justify","align-left","align-right","amazon","ambulance","anchor","android","angellist","angle-double-down","angle-double-left","angle-double-right","angle-double-up","angle-down","angle-left","angle-right","angle-up","apple","archive","area-chart","arrow-circle-down","arrow-circle-left","arrow-circle-o-down","arrow-circle-o-left","arrow-circle-o-right","arrow-circle-o-up","arrow-circle-right","arrow-circle-up","arrow-down","arrow-left","arrow-right","arrow-up","arrows","arrows-alt","arrows-h","arrows-v","asterisk","at","automobile","backward","balance-scale","ban","bank","bar-chart","bar-chart-o","barcode","bars","battery-0","battery-1","battery-2","battery-3","battery-4","battery-empty","battery-full","battery-half","battery-quarter","battery-three-quarters","bed","beer","behance","behance-square","bell","bell-o","bell-slash","bell-slash-o","bicycle","binoculars","birthday-cake","bitbucket","bitbucket-square","bitcoin","black-tie","bluetooth","bluetooth-b","bold","bolt","bomb","book","bookmark","bookmark-o","briefcase","btc","bug","building","building-o","bullhorn","bullseye","bus","buysellads","cab","calculator","calendar","calendar-check-o","calendar-minus-o","calendar-o","calendar-plus-o","calendar-times-o","camera","camera-retro","car","caret-down","caret-left","caret-right","caret-square-o-down","caret-square-o-left","caret-square-o-right","caret-square-o-up","caret-up","cart-arrow-down","cart-plus","cc","cc-amex","cc-diners-club","cc-discover","cc-jcb","cc-mastercard","cc-paypal","cc-stripe","cc-visa","certificate","chain","chain-broken","check","check-circle","check-circle-o","check-square","check-square-o","chevron-circle-down","chevron-circle-left","chevron-circle-right","chevron-circle-up","chevron-down","chevron-left","chevron-right","chevron-up","child","chrome","circle","circle-o","circle-o-notch","circle-thin","clipboard","clock-o","clone","close","cloud","cloud-download","cloud-upload","cny","code","code-fork","codepen","codiepie","coffee","cog","cogs","columns","comment","comment-o","commenting","commenting-o","comments","comments-o","compass","compress","connectdevelop","contao","copy","copyright","creative-commons","credit-card","credit-card-alt","crop","crosshairs","css3","cube","cubes","cut","cutlery","dashboard","dashcube","database","dedent","delicious","desktop","deviantart","diamond","digg","dollar","dot-circle-o","download","dribbble","dropbox","drupal","edge","edit","eject","ellipsis-h","ellipsis-v","empire","envelope","envelope-o","envelope-square","eraser","eur","euro","exchange","exclamation","exclamation-circle","exclamation-triangle","expand","expeditedssl","external-link","external-link-square","eye","eye-slash","eyedropper","facebook","facebook-f","facebook-official","facebook-square","fast-backward","fast-forward","fax","feed","female","fighter-jet","file","file-archive-o","file-audio-o","file-code-o","file-excel-o","file-image-o","file-movie-o","file-o","file-pdf-o","file-photo-o","file-picture-o","file-powerpoint-o","file-sound-o","file-text","file-text-o","file-video-o","file-word-o","file-zip-o","files-o","film","filter","fire","fire-extinguisher","firefox","flag","flag-checkered","flag-o","flash","flask","flickr","floppy-o","folder","folder-o","folder-open","folder-open-o","font","fonticons","fort-awesome","forumbee","forward","foursquare","frown-o","futbol-o","gamepad","gavel","gbp","ge","gear","gears","genderless","get-pocket","gg","gg-circle","gift","git","git-square","github","github-alt","github-square","gittip","glass","globe","google","google-plus","google-plus-square","google-wallet","graduation-cap","gratipay","group","h-square","hacker-news","hand-grab-o","hand-lizard-o","hand-o-down","hand-o-left","hand-o-right","hand-o-up","hand-paper-o","hand-peace-o","hand-pointer-o","hand-rock-o","hand-scissors-o","hand-spock-o","hand-stop-o","hashtag","hdd-o","header","headphones","heart","heart-o","heartbeat","history","home","hospital-o","hotel","hourglass","hourglass-1","hourglass-2","hourglass-3","hourglass-end","hourglass-half","hourglass-o","hourglass-start","houzz","html5","i-cursor","ils","image","inbox","indent","industry","info","info-circle","inr","instagram","institution","internet-explorer","intersex","ioxhost","italic","joomla","jpy","jsfiddle","key","keyboard-o","krw","language","laptop","lastfm","lastfm-square","leaf","leanpub","legal","lemon-o","level-down","level-up","life-bouy","life-buoy","life-ring","life-saver","lightbulb-o","line-chart","link","linkedin","linkedin-square","linux","list","list-alt","list-ol","list-ul","location-arrow","lock","long-arrow-down","long-arrow-left","long-arrow-right","long-arrow-up","magic","magnet","mail-forward","mail-reply","mail-reply-all","male","map","map-marker","map-o","map-pin","map-signs","mars","mars-double","mars-stroke","mars-stroke-h","mars-stroke-v","maxcdn","meanpath","medium","medkit","meh-o","mercury","microphone","microphone-slash","minus","minus-circle","minus-square","minus-square-o","mixcloud","mobile","mobile-phone","modx","money","moon-o","mortar-board","motorcycle","mouse-pointer","music","navicon","neuter","newspaper-o","object-group","object-ungroup","odnoklassniki","odnoklassniki-square","opencart","openid","opera","optin-monster","outdent","pagelines","paint-brush","paper-plane","paper-plane-o","paperclip","paragraph","paste","pause","pause-circle","pause-circle-o","paw","paypal","pencil","pencil-square","pencil-square-o","percent","phone","phone-square","photo","picture-o","pie-chart","pied-piper","pied-piper-alt","pinterest","pinterest-p","pinterest-square","plane","play","play-circle","play-circle-o","plug","plus","plus-circle","plus-square","plus-square-o","power-off","print","product-hunt","puzzle-piece","qq","qrcode","question","question-circle","quote-left","quote-right","ra","random","rebel","recycle","reddit","reddit-alien","reddit-square","refresh","registered","remove","renren","reorder","repeat","reply","reply-all","retweet","rmb","road","rocket","rotate-left","rotate-right","rouble","rss","rss-square","rub","ruble","rupee","safari","save","scissors","scribd","search","search-minus","search-plus","sellsy","send","send-o","server","share","share-alt","share-alt-square","share-square","share-square-o","shekel","sheqel","shield","ship","shirtsinbulk","shopping-bag","shopping-basket","shopping-cart","sign-in","sign-out","signal","simplybuilt","sitemap","skyatlas","skype","slack","sliders","slideshare","smile-o","soccer-ball-o","sort","sort-alpha-asc","sort-alpha-desc","sort-amount-asc","sort-amount-desc","sort-asc","sort-desc","sort-down","sort-numeric-asc","sort-numeric-desc","sort-up","soundcloud","space-shuttle","spinner","spoon","spotify","square","square-o","stack-exchange","stack-overflow","star","star-half","star-half-empty","star-half-full","star-half-o","star-o","steam","steam-square","step-backward","step-forward","stethoscope","sticky-note","sticky-note-o","stop","stop-circle","stop-circle-o","street-view","strikethrough","stumbleupon","stumbleupon-circle","subscript","subway","suitcase","sun-o","superscript","support","table","tablet","tachometer","tag","tags","tasks","taxi","television","tencent-weibo","terminal","text-height","text-width","th","th-large","th-list","thumb-tack","thumbs-down","thumbs-o-down","thumbs-o-up","thumbs-up","ticket","times","times-circle","times-circle-o","tint","toggle-down","toggle-left","toggle-off","toggle-on","toggle-right","toggle-up","trademark","train","transgender","transgender-alt","trash","trash-o","tree","trello","tripadvisor","trophy","truck","try","tty","tumblr","tumblr-square","turkish-lira","tv","twitch","twitter","twitter-square","umbrella","underline","undo","university","unlink","unlock","unlock-alt","unsorted","upload","usb","usd","user","user-md","user-plus","user-secret","user-times","users","venus","venus-double","venus-mars","viacoin","video-camera","vimeo","vimeo-square","vine","vk","volume-down","volume-off","volume-up","warning","wechat","weibo","weixin","whatsapp","wheelchair","wifi","wikipedia-w","windows","won","wordpress","wrench","xing","xing-square","y-combinator","y-combinator-square","yahoo","yc","yc-square","yelp","yen","youtube","youtube-play","youtube-square"]};},{}],52:[function(require,module,exports){'use strict'; // Lib
var beautify=require('js-beautify').js_beautify; // Views
var MessageModal=require('./MessageModal'); /**
 * A basic JSON editor for any object
 */var JSONEditor=function(_View2){_inherits(JSONEditor,_View2);function JSONEditor(params){_classCallCheck2(this,JSONEditor);var _this3=_possibleConstructorReturn(this,Object.getPrototypeOf(JSONEditor).call(this,params));_this3.$element=_.div({class:'json-editor flex-vertical'});_this3.$error=_.div({class:'panel panel-danger'},[_.div({class:'panel-heading'}),_.div({class:'panel-body'})]).hide();_this3.fetch();return _this3;} /**
     * Event: Click reload. Fetches the model again
     */_createClass(JSONEditor,[{key:"onClickReload",value:function onClickReload(){this.fetch();} /**
     * Event: Click save. Posts the model to the modelUrl
     */},{key:"onClickSave",value:function onClickSave(){var view=this;try{this.model=JSON.parse(this.value);$.post(this.modelUrl,this.model,function(){console.log('[JSONEditor] Saved model to '+view.modelUrl);});}catch(e){new MessageModal({model:{title:'Invalid JSON',body:e}});}} /**
     * Event: On click remove
     */},{key:"onClickDelete",value:function onClickDelete(){var view=this;function onSuccess(){console.log('[PageEditor] Removed page with id "'+view.model.id+'"');reloadResource('pages',function(){ViewHelper.get('NavbarMain').reload(); // Cancel the JSONEditor view
location.hash='/pages/';});}new MessageModal({model:{title:'Delete item',body:'Are you sure you want to delete the item "'+(view.model.title||view.model.name||view.model.id)+'"?'},buttons:[{label:'Cancel',class:'btn-default',callback:function callback(){}},{label:'OK',class:'btn-danger',callback:function callback(){$.ajax({url:'/api/pages/'+view.model.id,type:'DELETE',success:onSuccess});}}]});} /**
     * Event: Change text. Make sure the value is up to date
     */},{key:"onChangeText",value:function onChangeText($textarea){this.value=$textarea.val();try{this.model=JSON.parse(this.value);this.$error.hide();}catch(e){this.$error.children('.panel-heading').html('JSON error');this.$error.children('.panel-body').html(e);this.$error.show();}}},{key:"render",value:function render(){var view=this;this.value=beautify(JSON.stringify(this.model));this.$element.html([_.textarea({class:'flex-expand'},this.value).bind('keyup change propertychange paste',function(){view.onChangeText($(this));}),this.$error,_.div({class:'panel panel-default panel-buttons'},_.div({class:'btn-group'},[_.button({class:'btn btn-danger btn-raised'},'Delete').click(function(){view.onClickDelete();}),_.button({class:'btn btn-raised btn-primary'},'Reload').click(function(){view.onClickReload();}),_.button({class:'btn btn-raised btn-success'},'Save ').click(function(){view.onClickSave();})]))]);}}]);return JSONEditor;}(View);module.exports=JSONEditor;},{"./MessageModal":54,"js-beautify":38}],53:[function(require,module,exports){'use strict'; // Views
var MessageModal=require('./MessageModal');var MediaViewer=function(_View3){_inherits(MediaViewer,_View3);function MediaViewer(params){_classCallCheck2(this,MediaViewer);var _this4=_possibleConstructorReturn(this,Object.getPrototypeOf(MediaViewer).call(this,params));_this4.init();return _this4;} /**
     * Event: Click delete
     */_createClass(MediaViewer,[{key:"onClickDelete",value:function onClickDelete(){new MessageModal({model:{title:'Delete page',body:'Are you sure you want to delete this?'},buttons:[{label:'Cancel',class:'btn-default',callback:function callback(){}},{label:'OK',class:'btn-danger',callback:function callback(){}}]});}},{key:"render",value:function render(){var view=this;this.$element=_.div({class:'media-viewer panel panel-default'},[_.div({class:'panel-heading'},_.h4({class:'panel-title'},this.mediaId)),_.div({class:'panel-body'},function(){return _.img({class:'img-responsive',src:'/media/'+view.mediaId});}()),_.div({class:'panel-footer'},_.div({class:'btn-group'},[_.button({class:'btn btn-danger'},_.span({class:'fa fa-trash'})).click(this.onClickDelete)]))]);}}]);return MediaViewer;}(View);module.exports=MediaViewer;},{"./MessageModal":54}],54:[function(require,module,exports){'use strict'; /**
 * A basic modal for displaying messages to the user
 */var MessageModal=function(_View4){_inherits(MessageModal,_View4);function MessageModal(params){_classCallCheck2(this,MessageModal);var _this5=_possibleConstructorReturn(this,Object.getPrototypeOf(MessageModal).call(this,params));var otherModals=ViewHelper.getAll('MessageModal');for(var i in otherModals){if(otherModals[i]!=_this5){otherModals[i].remove();}}_this5.fetch();return _this5;}_createClass(MessageModal,[{key:"hide",value:function hide(){this.$element.modal('hide');}},{key:"show",value:function show(){this.$element.modal('show');}},{key:"render",value:function render(){var view=this;this.$element=_.div({class:'modal fade'},_.div({class:'modal-dialog'},_.div({class:'modal-content'},[_.div({class:'modal-header'},_.h4({class:'modal-title'},this.model.title)),_.div({class:'modal-body'},this.model.body),_.div({class:'modal-footer'},function(){if(view.buttons){return _.each(view.buttons,function(i,button){return _.button({class:'btn '+button.class},button.label).click(function(){view.hide();button.callback();});});}else {return _.button({class:'btn btn-default'},'OK').click(function(){view.hide();});}}())])));$('body').append(this.$element);this.$element.modal('show');}}]);return MessageModal;}(View);module.exports=MessageModal;},{}],55:[function(require,module,exports){'use strict'; // Views
var MessageModal=require('./MessageModal'); /**
 * The main navbar
 */var NavbarMain=function(_View5){_inherits(NavbarMain,_View5);function NavbarMain(params){_classCallCheck2(this,NavbarMain);var _this6=_possibleConstructorReturn(this,Object.getPrototypeOf(NavbarMain).call(this,params));_this6.$element=_.nav({class:'navbar-main'});_this6.fetch();return _this6;} /**
     * Event: Click copy page
     */_createClass(NavbarMain,[{key:"onClickCopyPage",value:function onClickCopyPage(){var view=this;var id=$('.context-menu-target-element').data('id'); // This function should only exist if an item has been copied
view.onClickPastePage=function onClickPastePage(){var parentId=$('.context-menu-target-element').data('id');$.getJSON('/api/pages/'+id,function(copiedPage){delete copiedPage['id'];copiedPage.parentId=parentId;$.post('/api/pages/new/',copiedPage,function(){reloadResource('pages',function(){view.reload();});view.onClickPastePage=null;});});};} /**
     * Event: Click cut page
     */},{key:"onClickCutPage",value:function onClickCutPage(){var view=this;var id=$('.context-menu-target-element').data('id'); // This function should only exist if an item has been cut
view.onClickPastePage=function onClickPastePage(){var parentId=$('.context-menu-target-element').data('id');$.getJSON('/api/pages/'+id,function(cutPage){cutPage.parentId=parentId;$.post('/api/pages/'+id,cutPage,function(){reloadResource('pages',function(){view.reload();});view.onClickPastePage=null;});});};} /**
     * Event: Click new page
     */},{key:"onClickNewPage",value:function onClickNewPage(){var view=this;$.post('/api/pages/new/',function(){reloadResource('pages',function(){view.reload();});});} /**
     * Event: Click remove page
     */},{key:"onClickRemovePage",value:function onClickRemovePage(){var view=this;var id=$('.context-menu-target-element').data('id');var name=$('.context-menu-target-element').data('name');function onSuccess(){console.log('[NavbarMain] Removed page with id "'+id+'"');reloadResource('pages',function(){view.reload(); // Cancel the PageEditor view if it was displaying the deleted page
if(location.hash=='#/pages/'+id){location.hash='/pages/';}});}new MessageModal({model:{title:'Delete page',body:'Are you sure you want to delete the page "'+name+'"?'},buttons:[{label:'Cancel',class:'btn-default',callback:function callback(){}},{label:'OK',class:'btn-danger',callback:function callback(){$.ajax({url:'/api/pages/'+id,type:'DELETE',success:onSuccess});}}]});} /**
     * Event: Click remove media
     */},{key:"onClickRemoveMedia",value:function onClickRemoveMedia(){var view=this;var id=$('.context-menu-target-element').data('id');var name=$('.context-menu-target-element').data('name');function onSuccess(){console.log('[NavbarMain] Removed media with id "'+id+'"');reloadResource('media',function(){view.reload(); // Cancel the MediaViever view if it was displaying the deleted object
if(location.hash=='#/media/'+id){location.hash='/media/';}});}new MessageModal({model:{title:'Delete media',body:'Are you sure you want to delete the media object "'+name+'"?'},buttons:[{label:'Cancel',class:'btn-default',callback:function callback(){}},{label:'OK',class:'btn-danger',callback:function callback(){$.ajax({url:'/api/media/'+id,type:'DELETE',success:onSuccess});}}]});} /**
     * Event: Click upload media
     */},{key:"onClickUploadMedia",value:function onClickUploadMedia(){var view=this;function onChangeFile(){var _this7=this;var input=$(this);var numFiles=this.files?this.files.length:1;if(numFiles>0){(function(){var file=_this7.files[0];var isImage=file.type=='image/png'||file.type=='image/jpeg'||file.type=='image/gif';var isVideo=file.type=='video/mpeg'||file.type=='video/mp4'||file.type=='video/quicktime'||file.type=='video/x-matroska';var reader=new FileReader();reader.onload=function(e){if(isImage){$uploadModal.find('.media-preview').html(_.img({src:e.target.result}));}if(isVideo){$uploadModal.find('.media-preview').html(_.video({src:e.target.result}));}$uploadModal.find('.spinner-container').toggleClass('hidden',true);};$uploadModal.find('.spinner-container').toggleClass('hidden',false);reader.readAsDataURL(file);console.log('Reading data of file type '+file.type+'...');})();}}function onClickUpload(){$uploadModal.find('form').submit();}function onSubmit(e){e.preventDefault();$uploadModal.find('.spinner-container').toggleClass('hidden',false);$.ajax({url:'/api/media/new',type:'POST',data:new FormData(this),processData:false,contentType:false,success:function success(id){$uploadModal.find('.spinner-container').toggleClass('hidden',true);var navbar=ViewHelper.get('NavbarMain');reloadResource('media',function(){navbar.reload();location.hash='/media/'+id;$uploadModal.modal('hide');});}});}var $uploadModal=_.div({class:'modal modal-upload-media fade'},_.div({class:'modal-dialog'},_.div({class:'modal-content'},[_.div({class:'modal-header'},_.h4({class:'modal-title'},'Upload a file')),_.div({class:'modal-body'},[_.div({class:'spinner-container hidden'},_.span({class:'spinner fa fa-refresh'})),_.div({class:'media-preview'})]),_.div({class:'modal-footer'},[_.div({class:'input-group'},[_.form({class:'form-control'},_.input({type:'file',name:'media'}).change(onChangeFile)).submit(onSubmit),_.div({class:'input-group-btn'},_.button({class:'btn btn-success'},'Upload').click(onClickUpload))])])])));$uploadModal.on('hidden.bs.modal',function(){$uploadModal.remove();});$('body').append($uploadModal);$uploadModal.modal('show');} /**
     * Fetches pane information and renders it
     *
     * @param {Object} params
     */},{key:"renderPane",value:function renderPane(params){var view=this;var $icon=params.$icon;if(!$icon){$icon=_.span({class:'fa fa-'+params.icon});}var $button=_.button({'data-route':params.route},[$icon,_.span(params.label)]).click(function(){var $currentTab=view.$element.find('.pane-container.active');if(params.route==$currentTab.attr('data-route')){location.hash=params.route;}else {view.showTab(params.route);}});var $pane=_.div({class:'pane'},_.div({class:'pane-content'}));var items=params.items;var sortingQueue=[]; // Attach item context menu
if(params.paneContextMenu){$pane.context(params.paneContextMenu);} // Items
$pane.append(_.each(items,function(i,item){var id=item.id||i;var name=item.title||item.name||id;var routingPath=item.shortPath||item.path||id;var queueItem={};var icon=item.icon;var $icon=void 0; // Truncate long names
if(name.length>18){name=name.substring(0,18)+'...';} // If this item has a schema id, fetch the appropriate icon
if(item.schemaId){icon=resources.schemas[item.schemaId].icon;}if(icon){$icon=_.span({class:'fa fa-'+icon});} // Item element
var $element=_.div({class:'pane-item-container','data-routing-path':routingPath,draggable:true},[_.a({'data-id':id,'data-name':name,href:'#'+params.route+routingPath,class:'pane-item'},[$icon,_.span(name)]),_.div({class:'children'})]); // Attach item context menu
if(params.itemContextMenu){$element.find('a').context(params.itemContextMenu);} // Add element to queue item
queueItem.$element=$element; // Use specific sorting behaviours
if(params.sort){params.sort(item,queueItem);} // Add queue item to sorting queue
sortingQueue.push(queueItem);return $element;})); // Sort items into hierarchy
var _iteratorNormalCompletion3=true;var _didIteratorError3=false;var _iteratorError3=undefined;try{for(var _iterator3=sortingQueue[Symbol.iterator](),_step3;!(_iteratorNormalCompletion3=(_step3=_iterator3.next()).done);_iteratorNormalCompletion3=true){var queueItem=_step3.value;if(queueItem.parentDirAttr){ // Find parent item
var parentDirAttrKey=Object.keys(queueItem.parentDirAttr)[0];var parentDirAttrValue=queueItem.parentDirAttr[parentDirAttrKey];var parentDirSelector='.pane-item-container['+parentDirAttrKey+'="'+parentDirAttrValue+'"]';var $parentDir=$pane.find(parentDirSelector);if($parentDir.length>0){$parentDir.children('.children').append(queueItem.$element); // Create parent item
}else if(queueItem.createDir){$parentDir=_.div({class:'pane-item-container'},[_.a({class:'pane-item'},[_.span({class:'fa fa-folder'}),_.span(parentDirAttrValue)]),_.div({class:'children'})]);$parentDir.attr(parentDirAttrKey,parentDirAttrValue); // TODO: Append to correct parent
$pane.append($parentDir);$parentDir.children('.children').append(queueItem.$element);}}}}catch(err){_didIteratorError3=true;_iteratorError3=err;}finally {try{if(!_iteratorNormalCompletion3&&_iterator3.return){_iterator3.return();}}finally {if(_didIteratorError3){throw _iteratorError3;}}}var $paneContainer=_.div({class:'pane-container','data-route':params.route},$pane);if(this.$element.find('.tab-panes .pane-container').length<1){$paneContainer.addClass('active');$button.addClass('active');}this.$element.find('.tab-panes').append($paneContainer);this.$element.find('.tab-buttons').append($button);} /**
     * Shows a tab
     *
     * @param {String} tabName
     */},{key:"showTab",value:function showTab(tabRoute){this.$element.find('.tab-panes .pane-container').each(function(i){$(this).toggleClass('active',$(this).attr('data-route')==tabRoute);});this.$element.find('.tab-buttons button').each(function(i){$(this).toggleClass('active',$(this).attr('data-route')==tabRoute);});} /**
     * Reloads this view
     */},{key:"reload",value:function reload(){var $currentTab=this.$element.find('.pane-container.active');var $currentItem=this.$element.find('.pane-container.active .pane-item-container.active');this.fetch();if($currentTab.length>0){var currentTabName=$currentTab.attr('data-route');if($currentItem.length>0){var currentRoute=$currentItem.attr('data-id')||$currentItem.attr('data-routing-path');this.highlightItem(currentRoute);}else {this.showTab(currentTabName);}}} /**
     * Highlights an item
     */},{key:"highlightItem",value:function highlightItem(route){var view=this;this.$element.find('.pane-item-container').each(function(i){var $item=$(this);$item.toggleClass('active',false);if($item.attr('data-id')==route||$item.attr('data-routing-path')==route){$item.toggleClass('active',true);view.showTab($item.parents('.pane-container').attr('data-route'));}});}},{key:"render",value:function render(){var view=this;this.$element.html([_.div({class:'tab-buttons'}),_.div({class:'tab-panes'})]);$('.navspace').html(this.$element);this.renderPane({label:'Endomon CMS',route:'/',$icon:_.span({class:'about-logo'},'E'),items:[{name:'About',path:'about'}]});this.renderPane({label:'Pages',route:'/pages/',icon:'file',items:resources.pages,itemContextMenu:{'This page':'---','Rename':function Rename(){view.onClickRenamePage();},'Copy':function Copy(){view.onClickCopyPage();},'Cut':function Cut(){view.onClickCutPage();},'Paste':function Paste(){view.onClickPastePage();},'Remove':function Remove(){view.onClickRemovePage();}},paneContextMenu:{'General':'---','Create new':function CreateNew(){view.onClickNewPage();}},sort:function sort(item,queueItem){queueItem.$element.attr('data-content-id',item.id);queueItem.parentDirAttr={'data-content-id':item.parentId};}});this.renderPane({label:'Sections',route:'/sections/',icon:'th',items:resources.sections,sort:function sort(item,queueItem){queueItem.$element.attr('data-content-id',item.id);queueItem.parentDirAttr={'data-content-id':item.parentId};}});this.renderPane({label:'Media',route:'/media/',icon:'file-image-o',items:resources.media,itemContextMenu:{'This media':'---','Remove':function Remove(){view.onClickRemoveMedia();}},paneContextMenu:{'General':'---','Upload new media':function UploadNewMedia(){view.onClickUploadMedia();}}});this.renderPane({label:'Schemas',route:'/schemas/',icon:'gears',items:resources.schemas,sort:function sort(item,queueItem){queueItem.$element.attr('data-schema-id',item.id);if(item.parentSchemaId){queueItem.parentDirAttr={'data-schema-id':item.parentSchemaId};}else {var schemaId=parseInt(item.id); // We only want to create parent directories for fields
if(schemaId>=20000){queueItem.createDir=true;queueItem.parentDirAttr={'data-schema-type':'Fields'};}}}});this.renderPane({label:'Settings',route:'/settings/',icon:'wrench',items:[{name:'Something',path:'something'}]});}}]);return NavbarMain;}(View);module.exports=NavbarMain;},{"./MessageModal":54}],56:[function(require,module,exports){'use strict'; // Views
var MessageModal=require('./MessageModal');var PageEditor=function(_View6){_inherits(PageEditor,_View6);function PageEditor(params){_classCallCheck2(this,PageEditor);var _this8=_possibleConstructorReturn(this,Object.getPrototypeOf(PageEditor).call(this,params));_this8.$element=_.div({class:'editor page-editor'});_this8.fetch();return _this8;} /**
     * Event: Click save. Posts the model to the modelUrl
     */_createClass(PageEditor,[{key:"onClickSave",value:function onClickSave(){var view=this;view.$saveBtn.toggleClass('saving',true);$.ajax({type:'post',url:view.modelUrl,data:view.model,success:function success(){console.log('[PageEditor] Saved model to '+view.modelUrl);view.$saveBtn.toggleClass('saving',false);reloadResource('pages',function(){var navbar=ViewHelper.get('NavbarMain');view.reload();navbar.reload();});},error:function error(err){new MessageModal({model:{title:'Error',body:err}});}});} /**
     * Event: Click toggle publish
     */},{key:"onClickTogglePublish",value:function onClickTogglePublish(){} /**
     * Event: On click remove
     */},{key:"onClickDelete",value:function onClickDelete(){var view=this;function onSuccess(){console.log('[PageEditor] Removed page with id "'+view.model.id+'"');reloadResource('pages',function(){ViewHelper.get('NavbarMain').reload(); // Cancel the PageEditor view
location.hash='/pages/';});}new MessageModal({model:{title:'Delete page',body:'Are you sure you want to delete the page "'+view.model.title+'"?'},buttons:[{label:'Cancel',class:'btn-default',callback:function callback(){}},{label:'OK',class:'btn-danger',callback:function callback(){$.ajax({url:'/api/pages/'+view.model.id,type:'DELETE',success:onSuccess});}}]});} /**
     * Reload this view
     */},{key:"reload",value:function reload(){this.model=null;this.fetch();} /**
     * Binds event to fire when field editors are ready
     * Or fires them if no callback was passed
     *
     * @param {Function} callback
     */},{key:"onFieldEditorsReady",value:function onFieldEditorsReady(callback){if(!this.fieldEditorReadyCallbacks){this.fieldEditorReadyCallbacks=[];}if(callback){this.fieldEditorReadyCallbacks.push(callback);}else {var _iteratorNormalCompletion4=true;var _didIteratorError4=false;var _iteratorError4=undefined;try{for(var _iterator4=this.fieldEditorReadyCallbacks[Symbol.iterator](),_step4;!(_iteratorNormalCompletion4=(_step4=_iterator4.next()).done);_iteratorNormalCompletion4=true){var registeredCallback=_step4.value;registeredCallback();}}catch(err){_didIteratorError4=true;_iteratorError4=err;}finally {try{if(!_iteratorNormalCompletion4&&_iterator4.return){_iterator4.return();}}finally {if(_didIteratorError4){throw _iteratorError4;}}}this.fieldEditorReadyCallbacks=[];}} /**
     * Renders a field view
     *
     * @param {Object} field
     * @param {Object} schema
     * @param {Function} inputHandler
     *
     * @return {Object} element
     */},{key:"renderFieldView",value:function renderFieldView(fieldValue,schemaValue,onChange,config){var fieldSchema=resources.schemas[schemaValue.schemaId];if(fieldSchema){var fieldEditor=resources.editors[fieldSchema.id];if(fieldEditor){var fieldEditorInstance=new fieldEditor({value:fieldValue,disabled:schemaValue.disabled,config:config});if(fieldEditorInstance.on){fieldEditorInstance.on('change',onChange);}else {fieldEditorInstance.onChange=onChange;}return fieldEditorInstance.$element;}else {console.log('[PageEditor] No editor found for field schema id "'+fieldSchema.id+'"');}}else {console.log('[PageEditor] No field schema found for schema id "'+schemaValue.schemaId+'"');}} /**
     * Renders a Page object
     *
     * @param {Object} data
     * @param {Object} schema
     *
     * @return {Object} element
     */},{key:"renderPageObject",value:function renderPageObject(object,schema){var view=this;return _.div({class:'object'},[_.ul({class:'nav nav-tabs'},_.each(schema.tabs,function(id,tab){return _.li({class:id==schema.defaultTabId?'active':''},_.a({'data-toggle':'tab',href:'#tab-'+id},tab));})),_.div({class:'tab-content'},_.each(schema.tabs,function(id,tab){var properties={};for(var alias in schema.properties){var property=schema.properties[alias];var noTabAssigned=!property.tabId;var isMetaTab=tab=='Meta';var thisTabAssigned=property.tabId==id;if(noTabAssigned&&isMetaTab||thisTabAssigned){properties[alias]=property;}}return _.div({id:'tab-'+id,class:'tab-pane'+(id==schema.defaultTabId?' active':'')},_.each(properties,function(key,value){return _.div({class:'field-container'},[_.div({class:'field-icon'},_.span({class:'fa fa-'+value.icon})),_.div({class:'field-key'},value.label||key),_.div({class:'field-value'},view.renderFieldView(object[key],schema.properties[key],function(newValue){object[key]=newValue;},value.config))]);}));}))]);}},{key:"render",value:function render(){var view=this;var pageSchema=getSchemaWithParents(this.model.schemaId);if(pageSchema){this.$element.html([this.renderPageObject(this.model,pageSchema).append(_.div({class:'panel panel-default panel-buttons'},_.div({class:'btn-group'},[_.button({class:'btn btn-danger btn-raised'},'Delete').click(function(){view.onClickDelete();}),view.$saveBtn=_.button({class:'btn btn-success btn-raised btn-save'},[_.span({class:'text-default'},'Save '),_.span({class:'text-saving'},'Saving ')]).click(function(){view.onClickSave();})])))]);this.onFieldEditorsReady();}}}]);return PageEditor;}(View);module.exports=PageEditor;},{"./MessageModal":54}],57:[function(require,module,exports){ // Icons
var icons=require('../icons.json').icons; /**
 * The editor for schemas
 *
 * @class View SchemaEditor
 * @param {Object} params
 */var SchemaEditor=function(_View7){_inherits(SchemaEditor,_View7);function SchemaEditor(params){_classCallCheck2(this,SchemaEditor);var _this9=_possibleConstructorReturn(this,Object.getPrototypeOf(SchemaEditor).call(this,params));_this9.$element=_.div({class:'editor schema-editor'});_this9.fetch();return _this9;} /**
     * Event: Click save. Posts the model to the modelUrl
     */_createClass(SchemaEditor,[{key:"onClickSave",value:function onClickSave(){var view=this;view.$saveBtn.toggleClass('saving',true);$.ajax({type:'post',url:view.modelUrl,data:view.model,success:function success(){console.log('[SchemaEditor] Saved model to '+view.modelUrl);view.$saveBtn.toggleClass('saving',false);reloadResource('schemas',function(){var navbar=ViewHelper.get('NavbarMain');navbar.reload();});},error:function error(err){new MessageModal({model:{title:'Error',body:err}});}});} /**
     * Renders the tabs editor
     *  
     * @return {Object} element
     */},{key:"renderTabsEditor",value:function renderTabsEditor(){var view=this;function onInputChange(){var $group=$(this).parents('.input-group');var id=$group.attr('data-id');view.model.tabs[id]=$(this).val();}function onClickRemove(){var $group=$(this).parents('.input-group');var id=$group.attr('data-id');delete view.model.tabs[id];render();}function onClickAdd(){var currentId=90000;var newId=-1;while(newId==-1){ // If the id already exists, increment                
if(view.compiledSchema.tabs[currentId.toString()]){currentId++;}else {newId=currentId;}}view.model.tabs[newId]='New tab';render();}function render(){var parentTabs={};if(view.parentSchema){parentTabs=view.parentSchema.tabs;}$element.empty();$element.append(_.each(parentTabs,function(id,label){return _.p({class:'tab'},label+' (inherited)');}));$element.append(_.each(view.model.tabs,function(id,label){return _.div({class:'tab input-group','data-id':id},[_.input({type:'text',class:'form-control',value:label}).bind('keyup change propertychange paste',onInputChange),_.div({class:'input-group-btn'},_.button({class:'btn btn-danger'},'Remove').click(onClickRemove))]);}),_.button({class:'btn btn-primary'},_.span('Add tab')).click(onClickAdd));}var $element=_.div({class:'tabs-editor'});render();return $element;} /**
     * Renders the icon editor
     *  
     * @return {Object} element
     */},{key:"renderIconEditor",value:function renderIconEditor(){var view=this;function onClickBrowse(){$element.find('.modal').modal('show');}function onClickSearch(){var query=$element.find('.modal input').val();console.log(query);}var $element=_.div({class:'icon-editor'},[_.button({class:'btn btn-default'},_.span({class:'fa fa-'+this.model.icon})).click(onClickBrowse),_.div({class:'modal fade'},_.div({class:'modal-dialog'},_.div({class:'modal-content'},_.div({class:'modal-body'},[_.div({class:'input-group'},[_.input({type:'text',class:'form-control'}),_.div({class:'input-group-btn'},_.button({class:'btn btn-primary'},'Search').click(onClickSearch))]),_.each(icons,function(i,icon){function onClickSelect(){view.model.icon=icon;$element.find('.btn-icon-browse .fa').attr('class','fa fa-'+icon);}return _.button({class:'btn btn-default'},_.span({class:'fa fa-'+icon})).click(onClickSelect);})]))))]);return $element;} /**
     * Renders the parent editor
     *  
     * @return {Object} element
     */},{key:"renderParentEditor",value:function renderParentEditor(){var view=this;function onChange(){view.model.parentSchemaId=$element.find('select').val();}function onClear(){view.model.parentSchemaId=null;$element.find('select').val(null);}var schemas={}; // TODO: Filter out irrelevant schemas and self
for(var id in resources.schemas){schemas[id]=resources.schemas[id];}var $element=_.div({class:'parent-editor input-group'},[_.select({class:'form-control'},_.each(schemas,function(id,schema){return _.option({value:id},schema.name);})).val(this.model.parentSchemaId).change(onChange),_.div({class:'input-group-btn'},_.button({class:'btn btn-primary'},'Clear').click(onClear))]);return $element;} /**
     * Renders the default tab editor
     *  
     * @return {Object} element
     */},{key:"renderDefaultTabEditor",value:function renderDefaultTabEditor(){var view=this;function onChange(){view.model.defaultTabId=$element.find('select').val();}var $element=_.div({class:'default-tab-editor'},_.select({class:'form-control'},_.each(this.compiledSchema.tabs,function(id,label){return _.option({value:id},label);})).val(this.model.defaultTabId).change(onChange));return $element;} /**
     * Renders a single field
     *
     * @return {Object} element
     */},{key:"renderField",value:function renderField(label,$content){return _.div({class:'field-container'},[_.div({class:'field-key'},label),_.div({class:'field-value'},$content)]);} /**
     * Renders all fields
     *
     * @return {Object} element
     */},{key:"renderFields",value:function renderFields(){var id=parseInt(this.model.id);var $element=_.div({class:'schema'}); // Page type
if(this.model.id<20000){$element.html([this.renderField('Icon',this.renderIconEditor()),this.renderField('Parent',this.renderParentEditor()),this.renderField('Default tab',this.renderDefaultTabEditor()),this.renderField('Tabs',this.renderTabsEditor())]);}return $element;}},{key:"render",value:function render(){var view=this;this.parentSchema=getSchemaWithParents(this.model.parentSchemaId);this.compiledSchema=getSchemaWithParents(this.model.id);if(this.model.locked){this.$element.html(_.div({class:'schema'},_.p('This schema is locked')));}else {this.$element.html([this.renderFields(),_.div({class:'panel panel-default panel-buttons'},_.div({class:'btn-group'},[_.button({class:'btn btn-danger btn-raised'},'Delete').click(function(){view.onClickDelete();}),view.$saveBtn=_.button({class:'btn btn-success btn-raised btn-save'},[_.span({class:'text-default'},'Save '),_.span({class:'text-saving'},'Saving ')]).click(function(){view.onClickSave();})]))]);}}}]);return SchemaEditor;}(View);module.exports=SchemaEditor;},{"../icons.json":51}]},{},[49]);