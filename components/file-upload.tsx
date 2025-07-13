"use client"

import { UploadDropzone } from "@/utils/uploadthing";
import { $Enums } from "@prisma/client"
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { X } from "lucide-react";

interface FileUploadProps{
    onChange : (value : {name:string, url:string, type:$Enums.FileType}[])=>void;
    value : {name:string, url:string, type:$Enums.FileType}[];
    taskId?: string; // Add taskId prop
}

export const FileUpload = ({value,onChange, taskId}:FileUploadProps) => {
    const [seletedType, setSelectedType] = useState<$Enums.FileType|undefined>(
        undefined
    )
    return <div>
        {value?.length>0 && <div className="flex flex-wrap gap-4 mb-4">
            {value.map((file,index) => (
                <div key={file?.url} className="relative w-[200px] h-[200px] rounded-lg">
                    
                        <Image
                        src = {file.type === "IMAGE" ? file.url:"/pdf.png"}
                        alt = {file.name}
                        className = "object-cover rounded-lg"
                        width={200}
                        height={100}
                        />
                    <button
                    onClick={()=>
                        onChange(value.filter((f) => f.url !== file.url))
                    }
                    className="absolute -top-2 -right-2 p-1 bg-rose-500 rounded-full text-white"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                </div>
            ))}
            </div>}
    {
        seletedType ? (
            <UploadDropzone
            endpoint={seletedType === "IMAGE"?"imageUploader":"documentUploader"}
            headers={taskId ? { 'x-task-id': taskId } : undefined} // Pass taskId via headers
            onClientUploadComplete={res=>{
                const newFiles = res?.map((f) => ({
                    name:f.name,
                    url:f.url,
                    type:seletedType,
                }))

                const updatedFiles = [...value, ...newFiles];
                onChange(updatedFiles);
                setSelectedType(undefined);
            }}
            onUploadError={(error:Error)=>{
                console.log(`ERROR:Upload ${error.message}`)
            }}
            />
        ):
        (
            <div className="flex items-center gap-2">
                <Button variant={"outline"}
                onClick={()=> setSelectedType("IMAGE")}
                className={cn(seletedType === "IMAGE" && "bg-slate-200")}>
                    Image
                </Button>
                <Button variant={"outline"}
                onClick={()=> setSelectedType("PDF")}
                className={cn(seletedType === "PDF" && "bg-slate-200")}>
                    PDF
                </Button>
            </div>
        )
    }
    </div>
}
