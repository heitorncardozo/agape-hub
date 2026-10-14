export function canManageSystem(user) {
    if (!user)
        return false;
    return user.role === 'coordenacao' || user.isCreator === true;
}
export function canManageSubdivisao(user, subdivisao) {
    if (!user)
        return false;
    if (canManageSystem(user))
        return true;
    if (!subdivisao)
        return false;
    return user.role === 'lideranca' && user.subdivisao === subdivisao;
}
export function canAccessFinancial(user) {
    if (!user)
        return false;
    if (canManageSystem(user))
        return true;
    return user.role === 'tesouraria';
}
