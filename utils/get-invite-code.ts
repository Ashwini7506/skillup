export const generateInviteCode = () =>{
    const characters = 
    "d6JqW9AybXo2rFgVnMm0PHZuY7ELcCkaRt1T3Ns85BdIqxKleOvGjpwhzU";

    let inviteCode =""

    for(let i=0; i<6; i++){
        const randomIndex = Math.floor(Math.random() * characters.length);
        inviteCode += characters[randomIndex]
    }

    return inviteCode
}