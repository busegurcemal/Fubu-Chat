using Microsoft.AspNetCore.SignalR;

namespace WebChatServer1.Hubs
{
    public class ChatHub : Hub
    {

        // bu yöntem tüm istemcilere bildirim gönderecek
        // istemcinin iletişim kurması gerekiyorsa <SendMessage()> metodunu çağıracak
        // istemcinin sunucudan bildirim alması gerekiyorsa <ReceiveMessage> metodunu kullanacaktır.

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }


        // Sohbete katılanlar dışında herkes bilgilendirilecek
        public async Task JoinChat(string user, string message)
        {
            //connectedClients[Context.ConnectionId] = user;
            await Clients.Others.SendAsync("ReceiveMessage", user, message);
        }

        public async Task LeaveChat(string user, string message)
        {
            //connectedClients[Context.ConnectionId] = user;
            await Clients.Others.SendAsync("ReceiveMessage", user, message);
        }
    }
}
