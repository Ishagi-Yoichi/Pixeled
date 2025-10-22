import ampq from "amqplib";

let channel;
const QUEUE = "image_tasks";

export async function connectRabbitMQ(){
    try{
        const connection = await ampq.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE,{durable:true});
        console.log("Connected to rabbitmq and queue created");
    }
    catch(err){
        console.error("RabbitMQ connection failed:",err);
    }
}

//send msg to queue
export async function sendToQueue(message) {
    if (!channel) throw new Error("RabbitMQ not initialized!");
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log("📤 Sent to queue:", message);
  }


//receive msg
export async function receiveFromQueue(callback){
    if(!channel) throw new Error("RabbitMQ not initialized");
    channel.consume(
        QUEUE,
        async (msg)=>{
            const data = JSON.parse(msg.content.toString());
            console.log("Received message",data);
            try{
                await callback(data);
                channel.ack(msg);
            }
            catch(err){
                console.error("Worker error",err);
                channel.nack(msg,false,false);//discards msg if it fails
            }
        },
        {noAck:false}
    );
}