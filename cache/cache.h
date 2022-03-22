#ifndef CACHE_H
#define CACHE_H

#include <stddef.h>

struct Container {
    char *name;
    struct Container *containers;
    struct Value *values;
    size_t n_containers;
    size_t n_values;
};

struct Value {
    char *name;
    char *val;
};

struct Container *cache_init(void);

#endif
