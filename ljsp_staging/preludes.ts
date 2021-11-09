// stdlib that must be done in js
// currently only primitive operations
const js_prelude =
	"const _plus=(a,b)=>a+b;const _dash=(a,b)=>a-b;const _star=(a,b)=>a*b;" +
	"const _slash=(a,b)=>a/b;const _percent=(a,b)=>a%b;const _openab=(a,b)=>a<b;" +
	"const _closeab=(a,b)=>a>b;const _equals=(a,b)=>a===b;" +
	"const string_dashreverse_exclam=(s)=>s.split('').reverse().join('');" +
	"const make_dasharray=(...args)=>args;const array_dashconcat=(a,b)=>a.concat(b);" +
	"const array_dashget=(a,i)=>a[i];const array_dashslice=(a,s,e)=>a.slice(a,s,e);" +
	"const array_dashlength=(a)=>a.length;const array_dashreverse_exclam=(a)=>a.reverse();";

const ljsp_prelude = `
(define cons (lambda (a b) (begin
  (define dispatch (lambda (n)
    (if (= n 0) a b)))
  dispatch)))

(define car (lambda (c) (c 0)))
(define cdr (lambda (c) (c 1)))

(define list (lambda ([elems]) (begin
  (define inner (lambda (cur [elems]) (begin
    (if (= (array-length elems) 0)
      cur
      (inner (cons (array-get elems 0) cur) (array-slice cur (array-length cur)) )))))
  (inner (array-reverse! elems)))))
`;

export { js_prelude, ljsp_prelude };

// vim: ts=2:sw=2:et:noai:nosi:nocindent:inde=
