// app/api/uploadthing/core.ts
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  // Image uploads
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const { user } = await userRequired();
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete for userId:", metadata.userId);
      
      // Save file to database (without taskId for now)
      await db.file.create({
        data: {
          url: file.url,
          name: file.name,
          type: "IMAGE",
          // taskId: null, // Can be updated later if needed
        }
      });

      return { uploadedBy: metadata.userId };
    }),

  // Document uploads (PDF only)
  documentUploader: f({
    "application/pdf": { 
      maxFileSize: "16MB", 
      maxFileCount: 3 
    },
  })
    .middleware(async ({ req }) => {
      const { user } = await userRequired();
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("PDF upload complete for userId:", metadata.userId);
      
      await db.file.create({
        data: {
          url: file.url,
          name: file.name,
          type: "PDF",
        }
      });

      return { uploadedBy: metadata.userId };
    }),

  // Video uploads
  videoUploader: f({
    video: {
      maxFileSize: "64MB",
      maxFileCount: 2,
    },
  })
    .middleware(async ({ req }) => {
      const { user } = await userRequired();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Video upload complete for userId:", metadata.userId);
      await db.file.create({
        data: {
          url: file.ufsUrl,
          name: file.name,
          type: "VIDEO",
        }
      });
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
