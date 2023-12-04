import {QueryBuilder} from "../types";

export class Union {
    builder: QueryBuilder;
    all: boolean;

    constructor(builder: QueryBuilder, all: boolean = false) {
        this.builder = builder;
        this.all = all;
    }
}
