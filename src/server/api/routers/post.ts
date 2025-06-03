import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { Post } from "../../models/Post";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const post = await Post.create({
        name: input.name,
        createdBy: ctx.session.user.id,
      });
      return post;
    }),

  getLatest: publicProcedure.query(async () => {
    const post = await Post.findOne()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");
    return post;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
