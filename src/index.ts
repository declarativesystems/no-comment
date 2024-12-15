/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { v4 as uuidv4 } from 'uuid';
import { pr } from "./github.ts";
import { JsonComment } from './types.ts';

const getFormField = (value: File | string | null) : string => {
    if (typeof value === "string") {
        return value;
    } else if (value instanceof File) {
        return "uploaded file removed";
    }
    else {
        return "missing";
    }
}

const getHiddenFieldOrFail = (field: string, value: File | string | null ) : string => {
    if (value === null || value instanceof File ) {
        throw new Error(`missing or invalid ${field}`);
    }
    return value;
}

const formToJson = (formData: FormData): JsonComment => {
    return {
        _id: uuidv4(),
        name: getFormField(formData.get("fields[name]")),
        email: getFormField(formData.get("fields[email]")),
        message: getFormField(formData.get("fields[message]")),
        date: Math.floor(Date.now() / 1000),
    }
}

export default {
    async fetch(request, env, ctx): Promise<Response> {
        const formData = await request.formData();
        const json = formToJson(formData);
        const pageSlug = getHiddenFieldOrFail("slug", formData.get("options[slug]"));
        const redirectPage = getHiddenFieldOrFail("slug", formData.get("options[redirect]"));
        const ok = await pr(env, pageSlug, json);
        if (ok) {
            return Response.redirect(redirectPage, 302);
        } else {
            return new Response("Sorry, there was an error");
        }
    },
} satisfies ExportedHandler<Env>;
