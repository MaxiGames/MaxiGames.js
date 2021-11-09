const lang_prelude = `
(define cons (lambda (a b) (begin
  (define dispatch (lambda (n)
    (if (= n 0) a b)))
  dispatch)))

(define car (lambda (c) (c 0)))
(define cdr (lambda (c) (c 1)))
`;

export { lang_prelude };

// vim: ts=2:sw=2:et:noai:nosi:nocindent:inde=
