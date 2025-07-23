import { postTable, usersTable } from '../db/schemas';
import authMiddleware from '../middlewares/auth';
import dbMiddleware from '../middlewares/db';
import { type Variables, type Bindings } from '..';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import z from 'zod/v4';
import { createPostSchema } from '@shared';

const postRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .use(authMiddleware)
    .use(dbMiddleware)
    .post('/', zValidator('json', createPostSchema), async c => {
        const { content } = c.req.valid('json');
        const { db } = c.var;
        const post = await db
            .insert(postTable)
            .values({
                content,
                authorId: c.get('user').id,
            })
            .returning();
        return c.json({ message: 'Post created', data: post[0] }, 201);
    })
    .get(
        '/',
        zValidator(
            'query',
            z.object({
                offset: z.coerce.number().min(0).optional().default(0),
                limit: z.coerce.number().min(1).max(100).optional().default(10),
            })
        ),
        async c => {
            const { offset, limit } = c.req.valid('query');
            const { db } = c.var;
            const posts = await db
                .select({
                    id: postTable.id,
                    content: postTable.content,
                    authorId: postTable.authorId,
                    createdAt: postTable.createdAt,
                    updatedAt: postTable.updatedAt,
                    author_id: usersTable.id,
                    author_name: usersTable.name,
                    author_username: usersTable.username,
                    author_avatar: usersTable.profilePicture,
                    author_email: usersTable.email,
                })
                .from(postTable)
                .leftJoin(usersTable, eq(postTable.authorId, usersTable.id))
                .offset(offset)
                .limit(limit);

            return c.json({ message: 'Success', data: posts }, 200);
        }
    )
    .get(
        '/:id',
        zValidator(
            'param',
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        c => {
            const id = c.req.valid('param').id;
            const { db } = c.var;
            const post = db
                .select()
                .from(postTable)
                .where(eq(postTable.id, id));
            return c.json({
                message: `Post details for id: ${id}`,
                data: post,
            });
        }
    )
    .put(
        '/:id',
        zValidator(
            'param',
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        zValidator('json', z.object({ content: z.string().min(1) })),
        async c => {
            const id = c.req.valid('param').id;
            const { content } = c.req.valid('json');
            const { db } = c.var;
            const post = await db
                .update(postTable)
                .set({ content, updatedAt: new Date().toISOString() })
                .where(eq(postTable.id, id))
                .returning();

            return c.json({
                message: `Post updated for id: ${id}`,
                data: post[0],
            });
        }
    )
    .delete(
        '/:id',
        zValidator(
            'param',
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        async c => {
            const id = c.req.valid('param').id;
            const { db } = c.var;
            await db.delete(postTable).where(eq(postTable.id, id));
            return c.json({
                message: `Post deleted for id: ${id}`,
                data: null,
            });
        }
    );

export default postRoute;
