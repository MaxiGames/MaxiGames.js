"""
This is for function-classes.

They are defined like this::

    def MyFClass(arg1, arg2):
        def addargs(arg3):
            return arg1 + arg2 + arg3
        ...define more procedures...
        return gendispatch(MyFClass, locals())

Note that these fclasses should not have any extraneous local variables;
all top-level local variables should be functions meant to be called,
or arguments passed.

An fclass is intantiated like so::

    mything = MyFClass(1, 2)

Getters are automatically generated. They are of the form "_<arg>".

All functions are called like this::

    mything("<fn_name>")(<args>)

For example::

    mything("addargs")(3)  # returns 1+2+3 = 6
    mything("arg1_")()  # returns arg1 which is 1
"""


def gendispatch(parent, parentlocals, *, no_gen_getters=False):
    """
    Generate the dispatch function.
    This is for use in a class-function (something inspired by chapter 2 of SICP)
    It generates the dispatch() routine which is to be returned.

    Note: This should be used like so::

        return gendispatch(<parent function object>, locals())

    The parent function and its locals have to be passed because of technical constraints.

    Due to how inheritance is implemented, you must not name a local (procedure or not)
    "_exposed" or "_getargs".

    Unless otherwise specified (by passing no_gen_getters as True)
    Getters are automatically generated: they are named "_<var>". If such a function
    has already been defined, it is not overwritten.

    See examples.py for more details.
    """

    def dispatch(n):
        s = (
            "if n=='_getargs':r=parent.__code__.co_varnames["
            ":parent.__code__.co_argcount"
            "]\n"  # return the parent arglist
        )

        for name, obj in parentlocals.items():
            if (
                callable(obj)
                and name[0] != "_"  # function
                and name  # non-'private'
                not in parent.__code__.co_varnames[: parent.__code__.co_argcount]
                # not an argument
            ):
                s += f"elif n.upper()=='{name.upper()}':r={name}\n"  # add it to the
                # if-else case tree

        # Generate getters
        if not no_gen_getters:
            for name in parent.__code__.co_varnames[: parent.__code__.co_argcount]:
                if (
                    f"_{name}" not in parentlocals.values()
                ):  # getter not already defined
                    s += f"elif n.upper()=='_{name.upper()}':\n" f" r=lambda:{name}\n"
                    parentlocals[f"_{name}"] = lambda: parentlocals[name]

        s += "if n == '_exposed': r = parentlocals\n"

        exec(
            s,
            {**globals(), **parentlocals},
            slocals := {
                **parentlocals,
                "n": n,
                "r": None,
                "parentlocals": parentlocals,
            },
        )
        return slocals["r"]  # that's the result

    return dispatch


def fcmerge(result, base, extend, extargs):
    """
    Merges two function-classes.
    Overlapping definitions will favour base2.
    Beware the order of arguments though; it's base1, then base2. Overlapping
    definitions from base2 will be in the base1's place. Use kwargs to be sure.

    "base" should be the base fc /called with initial args/.
    "extend" should be the extending fc /uncalled/.
    "extargs" should have arguments for "extend"

    The first argument of "extend" /must/ be for the base.
    However its name does not matter.

    Again, see examples.py for more details.
    """
    exposed = {**base("_exposed"), **extend(base, *extargs)("_exposed")}

    exec(
        f"""
def r({', '.join(sorted(exposed.keys()))}):
 return gendispatch(result, locals())
        """,
        {**globals(), **locals(), "r": None},
        slocals := {**locals(), "r": None},  # not sure if this is needed, but...
    )

    return slocals["r"](*(map(lambda p: p[1], sorted(exposed.items()))))
