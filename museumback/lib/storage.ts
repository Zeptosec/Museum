import axios from 'axios';
import fs from 'fs';

export const uploadFile = async (path: string) => {
    const form = new FormData();
    const blob = new Blob([fs.readFileSync(path)]);
    form.append('file1', blob);
    const rs = await axios.post(process.env.DISCORD_WEBHOOK as string, form)
    return rs.data.attachments[0].url as string;
};