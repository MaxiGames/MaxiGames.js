#include "cache.h"
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

struct Container *cache_init(void)
{
    return calloc(1, sizeof(struct Container));
}

bool cache_exists_container(struct Container *sp, char **path, size_t n_path_comp)
{
    if (n_path_comp == 0) {
        return true;
    }

    for (struct Container *p = sp->containers; p < sp->containers + sp->n_containers; p++) {
        if (p->name == path[0]) {
            return cache_exists_container(p, path + 1, n_path_comp - 1);
        }
    }

    return false;
}

bool cache_exists_value(struct Container *sp, char **path, size_t n_path_comp)
{
    if (n_path_comp == 1) {
        for (struct Value *p = sp->values; p < sp->values + sp->n_values; p++) {
            if (p->name == path[0]) {
                return true;
            }
        }
        return false;
    }

    for (struct Container *p = sp->containers; p < sp->containers + sp->n_containers; p++) {
        if (p->name == path[0]) {
            return cache_exists_container(p, path + 1, n_path_comp - 1);
        }
    }

    return false;
}

struct Container *cache_get_container(struct Container *sp, char **path, size_t n_path_comp)
{
    if (n_path_comp == 0) {
        return sp;
    }

    for (struct Container *p = sp->containers; p < sp->containers + sp->n_containers; p++) {
        if (p->name == path[0]) {
            return cache_get_container(p, path + 1, n_path_comp - 1);
        }
    }

    return NULL;
}

struct Value *cache_get_value(struct Container *sp, char **path, size_t n_path_comp)
{
    if (n_path_comp == 1) {
        for (struct Value *p = sp->values; p < sp->values + sp->n_values; p++) {
            if (p->name == path[0]) {
                return p;
            }
        }
        return NULL;
    }

    for (struct Container *p = sp->containers; p < sp->containers + sp->n_containers; p++) {
        if (p->name == path[0]) {
            return cache_get_value(p, path + 1, n_path_comp - 1);
        }
    }

    return NULL;
}

struct Container *cache_add_container(struct Container *sp, char **path, size_t n_path_comp)
{
    if (n_path_comp == 1) {
        struct Container *t = realloc(
                sp->containers,
                sizeof(struct Container) * (sp->n_containers + 1)
        );
        sp->containers = t;
        sp->containers[sp->n_containers] = (struct Container){
            .name = path[0],
            .containers = NULL,
            .values = NULL,
            .n_containers = 0,
            .n_values = 0,
        };
        sp->n_containers += 1;

        return sp->containers + sp->n_containers - 1;
    }

    for (struct Container *p = sp->containers; p < sp->containers + sp->n_containers; p++) {
        if (p->name == path[0]) {
            return cache_get_container(p, path + 1, n_path_comp - 1);
        }
    }

    return NULL; // to keep the compiler happy
}

struct Value *cache_add_value(struct Container *sp, char **path, size_t n_path_comp)
{
    if (n_path_comp == 1) {
        struct Value *t = realloc(
                sp->values,
                sizeof(struct Value) * (sp->n_values + 1)
        );
        sp->values = t;
        sp->values[sp->n_values] = (struct Value){
            .name = path[0],
            .val = NULL,
        };
        sp->n_containers += 1;

        return sp->values + sp->n_values - 1;
    }

    for (struct Container *p = sp->containers; p < sp->containers + sp->n_containers; p++) {
        if (p->name == path[0]) {
            return cache_get_value(p, path + 1, n_path_comp - 1);
        }
    }

    return NULL; // to keep the compiler happy
}

void cache_edit_value(struct Container *sp, char **path, char *val, size_t n_path_comp)
{
    if (n_path_comp == 1) {
        for (struct Value *p = sp->values; p < sp->values + sp->n_values; p++) {
            if (p->name == path[0]) {
                strcpy(p->val, val);
            }
        }
    }

    for (struct Container *p = sp->containers; p < sp->containers + sp->n_containers; p++) {
        if (p->name == path[0]) {
            cache_edit_value(p, path + 1, val, n_path_comp - 1);
        }
    }

    return;
}
