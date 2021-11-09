// stdlib that must be done in js
// currently only primitive operations
const js_prelude =
	"var _plus=(a,b)=>a+b;var _dash=(a,b)=>a-b;var _star=(a,b)=>a*b;" +
	"var _slash=(a,b)=>a/b;var _percent=(a,b)=>a%b;var _openab=(a,b)=>a<b;" +
	"var _closeab=(a,b)=>a>b;var _equals=(a,b)=>a===b;" +
	"var string_dashreverse_exclam=(s)=>s.split('').reverse().join('');" +
	"var make_dasharray=(...args)=>args;var array_dashconcat=(a,b)=>a.concat(b);" +
	"var array_dashget=(a,i)=>a[i];var array_dashslice=(a,s,e)=>a.slice(s,e);" +
	"var array_dashlength=(a)=>a.length;var array_dashreverse_exclam=(a)=>a.reverse();";

const ljsp_prelude = `
(define ; (lambda ([whatever]) nil))

(define cons (lambda (a b) (begin
  (define dispatch (lambda (n)
    (if (= n 0) a b)))
  dispatch)))

(define car (lambda (c) (c 0)))
(define cdr (lambda (c) (c 1)))

(define list (lambda ([elems]) (begin
  (define inner (lambda (cur elems) (begin
    (if (= (array-length elems) 0)
      cur
      (inner
        (cons (array-get elems 0) cur)
        (array-slice elems 1 (array-length elems)))))))

  (inner nil (array-reverse! elems)))))
`;

export { js_prelude, ljsp_prelude };

// vim: ts=2:sw=2:et:noai:nosi:nocindent:inde=
