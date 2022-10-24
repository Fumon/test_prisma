import { PrismaClient } from '@prisma/client';
import * as http from 'http';
import { URL } from 'url';

const prisma = new PrismaClient();



class userdto {
    name?: string
    constructor(name?: string) {
        this.name = name;
    }
}

class postdto {
    title: string;
    constructor(title:string) {
        this.title = title;
    }
}



async function router(req:http.IncomingMessage, res:http.ServerResponse) {
    const murl = new URL(req.url!, `http://${req.headers.host}`);

    // Split the url path into testable chunks
    const [_, ob, crud, ...rest] = murl.pathname.split("/");

    // Decide what to do based on the url
    switch (ob) {
        case "user":
            if(crud == "create") {
                const udto = new userdto(
                    murl.searchParams.get("username") ?? ""
                );

                
                const userid = await createUser(udto);
                console.log(`user creation returned ${userid}`);
            } else if (crud == "read") {

            }

            break;
        case "weird":
            if(crud == "create"){
            
                const [usermaybe, ..._] = rest;

                const userId = Number.parseInt(usermaybe);
                
                if(isNaN(userId)) {
                    res.statusCode = 400;
                    res.statusMessage = "Invalid request: userId not a number"
                    res.end();
                    return
                }

                const wdto = new weirdDto;
                wdto.whyweird = murl.searchParams.get("why") ?? "sOmEreaSon";
                
                await createWeird(userId, wdto);
            }
        default:
            break;
    }
    res.end();
}


class weirdDto {
    whyweird: string = ""
}

async function createWeird(userId: number, dto: weirdDto) {
    await prisma.weird.create({
        data: {
            userId: userId,
            ...dto
        }
    }).catch((reason) => {
        console.log(`Issue while creating weird: ${reason}`)
    })
}

async function createUser(dto: userdto): Promise<number|null> {
    const user = await prisma.user.create({
        data: {
            ...dto
        },
        select: {
            id: true
        }
    }).catch((reason) => {
        console.error(`User not created: ${reason}`)
        return null
    })

    return user?.id ?? null
}

async function main() {
    const server = http.createServer(router);

    server.listen(
        8000
    );
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })