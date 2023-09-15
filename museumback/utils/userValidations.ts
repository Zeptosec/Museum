import z from 'zod'

export const registerValidation = z.object({
    name: z.string().nonempty("name is required!").max(50, "name is too long! max 50!"),
    surname: z.string().nonempty("surname is required!").max(50, "surname is too long!"),
    email: z.string().email("incorrect email format").max(100, "email is too long!"),
    password: z.string().min(6, "password is too short!").max(32, "password is too long!"),
});

export const loginValidation = z.object({
    email: z.string().email("incorrect email format").max(100, "email is too long!"),
    password: z.string().min(6, "password is too short!").max(32, "password is too long!"),
})