export function getTypeDesc(ctx, state) {
    const type = state.type;
    return [type, ctx[type]];
}
