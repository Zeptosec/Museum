import { useLocalStorage } from '@vueuse/core';
import { defineStore, skipHydrate } from 'pinia'

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
    const user = ref<UserData | undefined>();
    function setUser(newUser: UserData | undefined){
        try {
            user.value = newUser;
        } catch (err) {
            console.error(err);
            console.error("Failed to stringify an object", newUser);
        }
    }

    function tokenExpired() {
        if (!user.value) return true;
        return user.value.accessTime + user.value.expiresIn < new Date().getTime();
    }

    return {
        user,
        setUser,
        tokenExpired,
    }
}, {
    persist: true
})