import { userRequired } from "@/app/data/user/is-user-authenticated";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/lib/db"; // Adjust this path to your actual database instance

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "1MB",
      maxFileCount: 3,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const {user} = await userRequired()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Get taskId from headers
      const taskId = req.headers.get('x-task-id');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id, taskId: taskId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // Save file to database
      if (metadata.taskId) {
        await db.file.create({
          data: {
            url: file.url,
            name: file.name,
            type: "IMAGE",
            taskId: metadata.taskId,
          }
        });
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
    // FileRouter for your app, can contain multiple FileRoutes

  // Define as many FileRoutes as you like, each with a unique routeSlug
  documentUploader: f({
    "application/pdf": {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 3,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const {user} = await userRequired()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Get taskId from headers
      const taskId = req.headers.get('x-task-id');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id, taskId: taskId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // Save file to database
      if (metadata.taskId) {
        await db.file.create({
          data: {
            url: file.url,
            name: file.name,
            type: "PDF",
            taskId: metadata.taskId,
          }
        });
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
