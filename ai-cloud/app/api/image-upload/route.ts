import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.Next_Public_Cloudinary_Cloud_Name, 
    api_key: process.env.Cloudinary_API_KEY, 
    api_secret: process.env.Cloudinary_API_SECRET // Click 'View API Keys' above to copy your API secret
});

interface CloudinaryUploadResult{
    public_id:string;
    [key:string]:any;
}


export async function POST(request:NextRequest) {
    const {userId} = auth()
    if(!userId){
        return NextResponse.json({error:"Unauthorized"},{status:401})
    }
    try {
        const formData = await request.formData() 
        const file = formData.get("file") as File | null;
        if(!file){
            return NextResponse.json({error:"File not found"},{status:400})
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes);

        await new Promise<CloudinaryUploadResult>(
            (resolve,reject)=>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    {folder:"next-cloudinary-uploads"},
                    (error,result)=>{
                        if(error) reject(error);
                        else resolve(result as CloudinaryUploadResult)
                    }
                )
                uploadStream.end(buffer)
            }
        )
    } catch (error) {
        
    }
}