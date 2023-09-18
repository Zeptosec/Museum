import { defineStore } from 'pinia'

export const RolesEnum = {
    GUEST: 'GUEST',
    CURATOR: 'CURATOR',
    ADMIN: 'ADMIN'
} as const;

export type Roles = typeof RolesEnum[keyof typeof RolesEnum]

export type UserData = {
    accessToken: string,
    accessTime: number,
    expiresIn: number, // ms
    name: string,
    surname: string,
    email: string,
    role: Roles
}

export const useUserStore = defineStore('user', () => {
    const localStorageUser = process.client ? localStorage.getItem('user') : undefined;
    let localUser: UserData | undefined;
    if (localStorageUser) {
        try {
            localUser = JSON.parse(localStorageUser) as UserData;
        } catch (err) {
            console.error(err);
            console.error(`${localStorageUser} is not in json format!`);
        }
    }
    const user = ref<UserData | undefined>(localUser);

    watch(user, (newUser, prevUser) => {
        try {
            localStorage.setItem('user', JSON.stringify(newUser));
        } catch (err) {
            console.error(err);
            console.error("Failed to stringify an object", newUser);
        }
    })

    function tokenExpired() {
        if (!user.value) return true;
        return user.value.accessTime + user.value.expiresIn < new Date().getTime();
    }

    return {
        user,
        tokenExpired
    }
})