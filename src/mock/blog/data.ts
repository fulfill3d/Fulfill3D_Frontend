export const mockPostList = [
    {
        "id": 1,
        "title": "Azure Service Bus Client Integration Proof of Concept",
        "slug": "azure-service-bus-client-integration-poc",
        "author": "John Doe",
        "tags": ["Azure Service Bus", "Messaging", "C#", ".NET"],
        "datePublished": "2024-09-13",
        "excerpt": "A proof of concept for integrating an Azure Service Bus client in a .NET application to send messages via the Azure Service Bus.",
        "image": "/images/servicebus-integration.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Azure Service Bus is a fully managed enterprise message broker that supports messaging between applications and services. This post demonstrates a proof of concept for integrating Azure Service Bus into a .NET application using a custom-built `ServiceBusClient`."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Setup",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "First, we need to configure a `ServiceBusClient` that handles the logic for sending messages to Azure Service Bus. The client will be set up using .NET dependency injection to allow for easy integration into various services or applications."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client\n{\n    public static class DepInj\n    {\n        public static void RegisterServiceBusClient(\n            this IServiceCollection services,\n            Action<ServiceBusClientOptions> configureServiceBusClientOptions)\n        {\n            services.ConfigureServiceOptions<ServiceBusClientOptions>((_, options) => configureServiceBusClientOptions(options));\n            services.AddTransient<IServiceBusClient, ServiceBusClient>();\n        }\n        \n        private static void ConfigureServiceOptions<TOptions>(\n            this IServiceCollection services,\n            Action<IServiceProvider, TOptions> configure)\n            where TOptions : class\n        {\n            services\n                .AddOptions<TOptions>()\n                .Configure<IServiceProvider>((options, resolver) => configure(resolver, options));\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In the above code, we define a `DepInj` class that registers the `ServiceBusClient` and its options using the dependency injection container. This will allow the client to be injected wherever it's needed."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Creating the Service Bus Client Interface",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client.Interfaces\n{\n    public interface IServiceBusClient\n    {\n        public Task SendMessage(ServiceBusClientMessage message);\n        public Task SendMessageWithTimeout(ServiceBusClientMessage message, CancellationToken cancellationToken);\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The interface `IServiceBusClient` defines the contract for sending messages to Azure Service Bus. It includes both a regular `SendMessage` method and a `SendMessageWithTimeout` method that accepts a `CancellationToken`."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Implementing the Service Bus Client",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.Options;\n\nnamespace Client\n{\n    public class ServiceBusClient(IOptions<ServiceBusClientOptions> configuration): IServiceBusClient\n    {\n        private readonly ServiceBusClientOptions _options = configuration.Value;\n        \n        public async Task SendMessage(ServiceBusClientMessage message)\n        {\n            await SendServiceBusMessage(message);\n        }\n\n        public async Task SendMessageWithTimeout(ServiceBusClientMessage message, CancellationToken cancellationToken)\n        {\n            await message.SendMessageWithTimeout(_options, cancellationToken);\n        }\n\n        private async Task SendServiceBusMessage(ServiceBusClientMessage message)\n        {\n            await message.SendMessage(_options);\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `ServiceBusClient` implementation handles sending messages to the Azure Service Bus. It accepts a `ServiceBusClientMessage`, which encapsulates the message and queue details, and sends it using the Azure Service Bus SDK."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Defining the Service Bus Message Model",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using System.Text;\nusing Azure.Messaging.ServiceBus;\n\nnamespace Client.Models\n{\n    public class ServiceBusClientMessage\n    {\n        public string Message { get; set; }\n        public string QueueName { get; set; }\n        public string? SessionId { get; set; }\n\n        public async Task SendMessage(Client.Options.ServiceBusClientOptions options)\n        {\n            await using var client = new Azure.Messaging.ServiceBus.ServiceBusClient(options.ConnectionString);\n            var sender = client.CreateSender(QueueName);\n            var serviceBusMessage = CreateServiceBusMessage();\n            await sender.SendMessageAsync(serviceBusMessage);\n        }\n\n        public async Task SendMessageWithTimeout(Client.Options.ServiceBusClientOptions options, CancellationToken cancellationToken)\n        {\n            await using var client = new Azure.Messaging.ServiceBus.ServiceBusClient(options.ConnectionString);\n            var sender = client.CreateSender(QueueName);\n            var serviceBusMessage = CreateServiceBusMessage();\n            await sender.SendMessageAsync(serviceBusMessage, cancellationToken);\n        }\n\n        private ServiceBusMessage CreateServiceBusMessage()\n        {\n            if (SessionId == null)\n            {\n                return new ServiceBusMessage(Encoding.UTF8.GetBytes(Message));\n            }\n            return new ServiceBusMessage(Encoding.UTF8.GetBytes(Message))\n            {\n                SessionId = SessionId\n            };\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `ServiceBusClientMessage` class is responsible for encapsulating the message details (such as the queue name, message content, and optional session ID) and sending it to Azure Service Bus using the Azure SDK."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Simple C# Program Example",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Here's a simple C# program that demonstrates how to use the `ServiceBusClient` to send a message to Azure Service Bus:"
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.DependencyInjection;\n\nclass Program\n{\n    static async Task Main(string[] args)\n    {\n        // Set up Dependency Injection\n        var serviceCollection = new ServiceCollection();\n        serviceCollection.RegisterServiceBusClient(options =>\n        {\n            options.ConnectionString = \"your-service-bus-connection-string\";\n        });\n        var serviceProvider = serviceCollection.BuildServiceProvider();\n\n        // Resolve ServiceBusClient\n        var serviceBusClient = serviceProvider.GetService<IServiceBusClient>();\n\n        // Create a service bus message\n        var message = new ServiceBusClientMessage\n        {\n            Message = \"Hello from Azure Service Bus\",\n            QueueName = \"my-queue\"\n        };\n\n        // Send the message\n        await serviceBusClient.SendMessage(message);\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Integrating Service Bus Client into Azure Functions or ASP.NET Core",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `ServiceBusClient` can be easily integrated into an Azure Function or an ASP.NET Core application using dependency injection. The same principles used for registering the client in a console app can be applied in Azure Functions and ASP.NET Core, with the client being injected into the required services or controllers."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Azure Functions Integration in .NET 8 Isolated Worker",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In .NET 8, Azure Functions use the Isolated Worker model. The `ServiceBusClient` can be registered using the `HostBuilder` in the `Program.cs` file. Once registered, it can be injected into your function classes to send messages in response to HTTP or other types of triggers. You will need to ensure that the connection string for the Service Bus is provided in your application configuration."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "ASP.NET Core Integration",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In ASP.NET Core, you can register the `ServiceBusClient` in the `ConfigureServices` method within the `Startup.cs` or `Program.cs`. This will allow the client to be injected into any services or controllers that need to interact with Azure Service Bus. The connection string can be managed via app settings, and you can inject the `ServiceBusClient` wherever needed."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview",
                    "text": "Azure Service Bus Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/azure-functions/",
                    "text": "Azure Functions Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/aspnet/core/",
                    "text": "ASP.NET Core Documentation"
                }
            }
        ]
    },
    {
        "id": 2,
        "title": "SendGrid Client Integration Proof of Concept",
        "slug": "sendgrid-client-integration-poc",
        "author": "John Doe",
        "tags": ["SendGrid", "API", "C#", ".NET"],
        "datePublished": "2024-09-13",
        "excerpt": "A proof of concept for integrating SendGrid client in a .NET application to send emails via the SendGrid API.",
        "image": "/images/sendgrid-integration.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "SendGrid is a cloud-based email service that provides scalable and reliable email delivery. It allows developers to send transactional, marketing, and notification emails without having to maintain their own email servers. This post demonstrates a proof of concept for integrating SendGrid in a .NET application using a custom-built client."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Setup",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "First, we need to configure a `SendGridClient` that uses RestSharp to send requests to the SendGrid API. The client will handle the sending of emails, and we will use .NET dependency injection for configuration."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client\n{\n    public static class DepInj\n    {\n        public static void RegisterSendGridClient(this IServiceCollection services,\n            Action<SendGridOptions> configureSendGridOptions)\n        {\n            services.ConfigureServiceOptions<SendGridOptions>((_, opt) => configureSendGridOptions(opt));\n            services.AddTransient<ISendGridClient, SendGridClient>();\n        }\n\n        private static void ConfigureServiceOptions<TOptions>(\n            this IServiceCollection services,\n            Action<IServiceProvider, TOptions> configure)\n            where TOptions : class\n        {\n            services\n                .AddOptions<TOptions>()\n                .Configure<IServiceProvider>((options, resolver) => configure(resolver, options));\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In the above code, we define a `DepInj` class that registers the `SendGridClient` and its options in the dependency injection container."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Creating the SendGrid Client Interface",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client.Interfaces\n{\n    public interface ISendGridClient\n    {\n        Task<bool> SendEmailAsync(EmailMessage message);\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The interface `ISendGridClient` defines the contract for the client to send emails asynchronously."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Implementing the SendGrid Client",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using System.Net;\nusing Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.Options;\nusing RestSharp;\n\nnamespace Client\n{\n    public class SendGridClient(IOptions<SendGridOptions> options) : ISendGridClient\n    {\n        private readonly SendGridOptions _options = options.Value;\n        private readonly RestClient _client = new RestClient(\"https://api.sendgrid.com/v3\");\n\n        public async Task<bool> SendEmailAsync(EmailMessage message)\n        {\n            var request = new RestRequest(\"mail/send\", Method.Post);\n            request.AddHeader(\"Authorization\", $\"Bearer {_options.ApiKey}\");\n            request.AddJsonBody(new\n            {\n                personalizations = new[]\n                {\n                    new\n                    {\n                        to = new[] { new { email = message.To } },\n                        subject = message.Subject\n                    }\n                },\n                from = new { email = message.From },\n                content = new[]\n                {\n                    new\n                    {\n                        type = message.IsHtml ? \"text/html\" : \"text/plain\",\n                        value = message.Body\n                    }\n                }\n            });\n\n            var response = await _client.ExecuteAsync(request);\n            return response.StatusCode == HttpStatusCode.Accepted;\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `SendGridClient` implementation sends a request to the SendGrid API to send an email."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Simple C# Program Example",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Here's a simple C# program that demonstrates how to use the `SendGridClient` to send an email:"
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.DependencyInjection;\n\nclass Program\n{\n    static async Task Main(string[] args)\n    {\n        // Set up Dependency Injection\n        var serviceCollection = new ServiceCollection();\n        serviceCollection.RegisterSendGridClient(options =>\n        {\n            options.ApiKey = \"your-sendgrid-api-key\";\n        });\n        var serviceProvider = serviceCollection.BuildServiceProvider();\n\n        // Resolve SendGridClient\n        var sendGridClient = serviceProvider.GetService<ISendGridClient>();\n\n        // Create an email message\n        var message = new EmailMessage\n        {\n            From = \"sender@example.com\",\n            To = \"recipient@example.com\",\n            Subject = \"Hello from SendGrid\",\n            Body = \"This is a test email sent using SendGrid.\",\n            IsHtml = false\n        };\n\n        // Send the email\n        bool result = await sendGridClient.SendEmailAsync(message);\n\n        if (result)\n        {\n            Console.WriteLine(\"Email sent successfully!\");\n        }\n        else\n        {\n            Console.WriteLine(\"Failed to send email.\");\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Integrating SendGrid Client into Azure Functions or ASP.NET Core",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `SendGridClient` can be easily integrated into both Azure Functions (in the Isolated Worker model for .NET 8) and ASP.NET Core applications using dependency injection (DI). In both scenarios, you need to register the `SendGridClient` in the startup configuration."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Azure Functions Integration in .NET 8 Isolated Worker",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In .NET 8, Azure Functions use the Isolated Worker model, which separates the function execution from the Azure Functions runtime. To use the `SendGridClient` in this model, you need to configure it in the `Program.cs` file. In the Isolated Worker model, dependency injection (DI) is set up via the `HostBuilder`, and the `SendGridClient` must be registered during the application startup. This setup will allow the client to be injected into your Azure Functions to send emails. You also need to configure the `SendGridOptions` with your API key in this process."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "ASP.NET Core Integration",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In an ASP.NET Core application, you register the `SendGridClient` within the `Startup.cs` or `Program.cs` file. This is done in the `ConfigureServices` method, where the `SendGridClient` is added to the service container with the necessary configuration for the SendGrid API key. Once registered, the client can be injected into controllers, services, or other components where it is needed to send emails."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://sendgrid.com/docs/API_Reference/api_v3.html",
                    "text": "SendGrid API Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/azure-functions/",
                    "text": "Azure Functions Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/aspnet/core/",
                    "text": "ASP.NET Core Documentation"
                }
            }
        ]
    },
    {
        "id": 3,
        "title": "Google Maps Client Integration Proof of Concept",
        "slug": "google-maps-client-integration-poc",
        "author": "John Doe",
        "tags": ["Google Maps", "Geocoding", "C#", ".NET"],
        "datePublished": "2024-09-13",
        "excerpt": "A proof of concept for integrating a Google Maps client in a .NET application to get geocoding data from the Google Maps API.",
        "image": "/images/google-maps-integration.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Google Maps is one of the most widely used mapping services available, providing geocoding, routing, and location data. This post demonstrates a proof of concept for integrating the Google Maps API into a .NET application using a custom-built `GoogleMapsClient` to retrieve geocoding data."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Setup",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "First, we need to configure a `GoogleMapsClient` that will handle geocoding requests to the Google Maps API. We will use .NET dependency injection to manage the client’s configuration and ensure it can be easily integrated into services or applications."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client\n{\n    public static class DepInj\n    {\n        public static void RegisterGoogleMapsClient(\n            this IServiceCollection services, Action<GoogleMapsOptions> config)\n        {\n            services.ConfigureServiceOptions<GoogleMapsOptions>((_, opt) => config(opt));\n            services.AddTransient<IGoogleMapsClient, GoogleMapsClient>();\n        }\n        \n        private static void ConfigureServiceOptions<TOptions>(\n            this IServiceCollection services,\n            Action<IServiceProvider, TOptions> configure)\n            where TOptions : class\n        {\n            services\n                .AddOptions<TOptions>()\n                .Configure<IServiceProvider>((options, resolver) => configure(resolver, options));\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In the above code, we define a `DepInj` class that registers the `GoogleMapsClient` and its options using the dependency injection container. This allows the client to be injected wherever it’s needed within the application."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Creating the Google Maps Client Interface",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client.Interfaces\n{\n    public interface IGoogleMapsClient\n    {\n        Task<Location?> GetCoordinatesAsync(GeocodingRequest request);\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `IGoogleMapsClient` interface defines the contract for the client, which includes a method to send geocoding requests to Google Maps and retrieve the corresponding latitude and longitude coordinates."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Implementing the Google Maps Client",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.Logging;\nusing Microsoft.Extensions.Options;\nusing Newtonsoft.Json;\nusing RestSharp;\n\nnamespace Client\n{\n    public class GoogleMapsClient(IOptions<GoogleMapsOptions> options, ILogger<GoogleMapsClient> logger): RestClient, IGoogleMapsClient\n    {\n        private const int MaxRetryCount = 2;\n        private readonly GoogleMapsOptions _options = options.Value;\n        private readonly RestClient _client = new (new RestClientOptions\n        {\n            BaseUrl = new Uri(\"https://maps.googleapis.com/maps/api/geocode/json\"),\n            Timeout = TimeSpan.FromSeconds(30)\n        });\n\n        public async Task<Location?> GetCoordinatesAsync(GeocodingRequest request)\n        {\n            var restRequest = new RestRequest();\n            restRequest.AddQueryParameter(\"address\", request.Address);\n            restRequest.AddQueryParameter(\"key\", _options.ApiKey);\n\n            var response = await ExecuteWithPolicyAsync<GeocodingResponse>(restRequest);\n            var content = response.Content;\n            if (content == null)\n            {\n                return null;\n            }\n            var geocodingResponse = JsonConvert.DeserializeObject<GeocodingResponse>(content);\n\n            if (geocodingResponse?.Results != null && geocodingResponse.Results.Any())\n            {\n                var location = geocodingResponse.Results.First().Geometry.Location;\n                logger.LogInformation($\"Manually deserialized Location: Latitude {location.Latitude}, Longitude {location.Longitude}\");\n                return location;\n            }\n            logger.LogError(\"Failed to deserialize the response content or no results found.\");\n\n            return null;\n        }\n\n        private async Task<RestResponse<T>> ExecuteWithPolicyAsync<T>(RestRequest request)\n        {\n            var retryCount = 0;\n            RestResponse<T> response;\n\n            do\n            {\n                response = await _client.ExecuteAsync<T>(request);\n\n                if (response.IsSuccessful)\n                {\n                    return response;\n                }\n\n                logger.LogError($\"Google Maps API request failed: {response.StatusCode}\");\n                logger.LogError(response.Content);\n\n                retryCount++;\n\n                if (retryCount >= MaxRetryCount)\n                {\n                    break;\n                }\n\n                await HandleRetry(response.StatusCode);\n            }\n            while (true);\n\n            return response;\n        }\n\n        private async Task HandleRetry(System.Net.HttpStatusCode statusCode)\n        {\n            switch (statusCode)\n            {\n                case System.Net.HttpStatusCode.TooManyRequests:\n                    logger.LogInformation(\"Too many requests. Retrying in 2 seconds...\");\n                    await Task.Delay(2000);\n                    break;\n                case System.Net.HttpStatusCode.BadGateway:\n                    logger.LogInformation(\"Bad Gateway error. Retrying in 5 seconds...\");\n                    await Task.Delay(5000);\n                    break;\n                default:\n                    await Task.CompletedTask;\n                    break;\n            }\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `GoogleMapsClient` implements the geocoding logic by sending a request to the Google Maps API with the specified address and API key. It handles retries and error logging, and deserializes the response to extract the location's latitude and longitude."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Defining the Geocoding Request and Response Models",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client.Models\n{\n    public class GeocodingRequest\n    {\n        public string Address { get; set; }\n    }\n}\n\nusing Newtonsoft.Json;\n\nnamespace Client.Models\n{\n    public class GeocodingResponse\n    {\n        [JsonProperty(\"results\")] public List<Result> Results { get; set; }\n\n        [JsonProperty(\"status\")] public string Status { get; set; }\n\n        public class Result\n        {\n            [JsonProperty(\"geometry\")] public Geometry Geometry { get; set; }\n        }\n\n        public class Geometry\n        {\n            [JsonProperty(\"location\")] public Location Location { get; set; }\n        }\n    }\n}\n\nnamespace Client.Models\n{\n    public class Location\n    {\n        [JsonProperty(\"lat\")] public double Latitude { get; set; }\n\n        [JsonProperty(\"lng\")] public double Longitude { get; set; }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `GeocodingRequest` class represents the address to be geocoded, and the `GeocodingResponse` class represents the response from the Google Maps API, which includes the location's latitude and longitude."
                }
            },    {
                "type": "heading",
                "data": {
                    "text": "Simple C# Program Example",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Here's a simple C# program that demonstrates how to use the `GoogleMapsClient` to get geocoding data from the Google Maps API:"
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.DependencyInjection;\n\nclass Program\n{\n    static async Task Main(string[] args)\n    {\n        // Set up Dependency Injection\n        var serviceCollection = new ServiceCollection();\n        serviceCollection.RegisterGoogleMapsClient(options =>\n        {\n            options.ApiKey = \"your-google-maps-api-key\";\n        });\n        var serviceProvider = serviceCollection.BuildServiceProvider();\n\n        // Resolve GoogleMapsClient\n        var googleMapsClient = serviceProvider.GetService<IGoogleMapsClient>();\n\n        // Create a geocoding request\n        var request = new GeocodingRequest\n        {\n            Address = \"1600 Amphitheatre Parkway, Mountain View, CA\"\n        };\n\n        // Get coordinates\n        var location = await googleMapsClient.GetCoordinatesAsync(request);\n\n        if (location != null)\n        {\n            Console.WriteLine($\"Latitude: {location.Latitude}, Longitude: {location.Longitude}\");\n        }\n        else\n        {\n            Console.WriteLine(\"Failed to retrieve coordinates.\");\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Integrating Google Maps Client into Azure Functions or ASP.NET Core",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `GoogleMapsClient` can be easily integrated into an Azure Function or an ASP.NET Core application using dependency injection. The same principles used for registering the client in a console app can be applied in Azure Functions and ASP.NET Core, with the client being injected into the required services or controllers."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Azure Functions Integration in .NET 8 Isolated Worker",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In .NET 8, Azure Functions use the Isolated Worker model. The `GoogleMapsClient` can be registered using the `HostBuilder` in the `Program.cs` file. Once registered, it can be injected into your function classes to retrieve geocoding data in response to HTTP or other types of triggers. You will need to ensure that the API key for Google Maps is provided in your application configuration."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "ASP.NET Core Integration",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In ASP.NET Core, you can register the `GoogleMapsClient` in the `ConfigureServices` method within the `Startup.cs` or `Program.cs`. This will allow the client to be injected into any services or controllers that need to interact with the Google Maps API. The API key can be managed via app settings, and you can inject the `GoogleMapsClient` wherever needed."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://developers.google.com/maps/documentation/geocoding/start",
                    "text": "Google Maps Geocoding API Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/azure-functions/",
                    "text": "Azure Functions Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/aspnet/core/",
                    "text": "ASP.NET Core Documentation"
                }
            }
        ]
    },
    {
        "id": 4,
        "title": "Azure Blob Storage Client Integration Proof of Concept",
        "slug": "azure-blob-storage-client-integration-poc",
        "author": "John Doe",
        "tags": ["Azure Blob Storage", "File Storage", "C#", ".NET"],
        "datePublished": "2024-09-13",
        "excerpt": "A proof of concept for integrating an Azure Blob Storage client in a .NET application to upload, download, and delete blobs.",
        "image": "/images/blob-storage-integration.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Azure Blob Storage is a scalable, secure, and highly available object storage solution from Microsoft Azure. This post demonstrates a proof of concept for integrating Azure Blob Storage into a .NET application using a custom-built `BlobStorageClient` to handle file uploads, downloads, and deletion."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Setup",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "First, we need to configure a `BlobStorageClient` that will handle interactions with Azure Blob Storage. We will use .NET dependency injection to manage the client’s configuration and ensure it can be easily integrated into services or applications."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client\n{\n    public static class DepInj\n    {\n        public static void RegisterBlobStorageClient(\n            this IServiceCollection services, Action<BlobStorageClientOptions> configureOptions)\n        {\n            services.ConfigureServiceOptions<BlobStorageClientOptions>((_, options) => configureOptions(options));\n            services.AddTransient<IBlobStorageClient, BlobStorageClient>();\n        }\n        \n        private static void ConfigureServiceOptions<TOptions>(\n            this IServiceCollection services,\n            Action<IServiceProvider, TOptions> configure)\n            where TOptions : class\n        {\n            services\n                .AddOptions<TOptions>()\n                .Configure<IServiceProvider>((options, resolver) => configure(resolver, options));\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In the above code, we define a `DepInj` class that registers the `BlobStorageClient` and its options using the dependency injection container. This allows the client to be injected wherever it’s needed."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Creating the Blob Storage Client Interface",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Client.Interfaces\n{\n    public interface IBlobStorageClient\n    {\n        Task<string> Upload(Blob blob);\n        Task<Stream> Download(Blob blob);\n        Task Delete(Blob blob);\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `IBlobStorageClient` interface defines the contract for the client, which includes methods to upload, download, and delete blobs in Azure Blob Storage."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Implementing the Blob Storage Client",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Azure.Storage.Blobs;\nusing Azure.Storage.Blobs.Models;\nusing Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.Options;\n\nnamespace Client\n{\n    public class BlobStorageClient(IOptions<BlobStorageClientOptions> options): IBlobStorageClient\n    {\n        private readonly BlobStorageClientOptions _configuration = options.Value;\n\n        public async Task<string> Upload(Blob blob)\n        {\n            try\n            {\n                var blockBlobClient = await blob.GetBlockBlobClient(_configuration);\n                await blockBlobClient.UploadAsync(blob.Stream, blob.Options);\n                return blockBlobClient.Uri.AbsoluteUri;\n            }\n            catch (Exception e)\n            {\n                return string.Empty;\n            }\n        }\n\n        public async Task<Stream> Download(Blob blob)\n        {\n            var blockBlobClient = await blob.GetBlockBlobClient(_configuration);\n            BlobDownloadInfo downloadInfo = await blockBlobClient.DownloadAsync();\n            return downloadInfo.Content;\n        }\n\n        public async Task Delete(Blob blob)\n        {\n            try\n            {\n                BlobServiceClient blobServiceClient = new BlobServiceClient(_configuration.ConnectionString);\n                BlobContainerClient container = blobServiceClient.GetBlobContainerClient(blob.Container);\n                var item = container.GetBlobClient(blob.Name);\n                await item.DeleteIfExistsAsync();\n            }\n            catch (Exception e)\n            {\n                throw new InvalidOperationException();\n            }\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `BlobStorageClient` implements the logic for uploading, downloading, and deleting blobs in Azure Blob Storage. It interacts with the Azure SDK and handles the operations through the `Blob` model."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Defining the Blob Model",
                    "level": 2
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using System.Text;\nusing Azure.Storage.Blobs;\nusing Azure.Storage.Blobs.Models;\nusing Azure.Storage.Blobs.Specialized;\n\nnamespace Client.Models\n{\n    public class Blob\n    {\n        public string Name { get; set; }\n        public BlobUploadOptions Options { get; set; }\n        public string Container { get; set; }\n        private Stream _stream;\n        public Stream Stream { get => _stream; private set => _stream = value; }\n\n        public byte[]? Bytes { get; set; }\n        public string? Text { get; set; }\n\n        public async Task<BlockBlobClient> GetBlockBlobClient(BlobStorageClientOptions configuration)\n        {\n            var blobContainerClient = new BlobContainerClient(configuration.ConnectionString, Container);\n            return blobContainerClient.GetBlockBlobClient(Name);\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `Blob` model encapsulates the details of a blob, including its name, container, and options for uploading. It also includes helper methods to retrieve `BlockBlobClient` objects for interacting with Azure Blob Storage."
                }
            },    {
                "type": "heading",
                "data": {
                    "text": "Simple C# Program Example",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Here's a simple C# program that demonstrates how to use the `BlobStorageClient` to upload, download, and delete blobs from Azure Blob Storage:"
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Client.Interfaces;\nusing Client.Models;\nusing Client.Options;\nusing Microsoft.Extensions.DependencyInjection;\n\nclass Program\n{\n    static async Task Main(string[] args)\n    {\n        // Set up Dependency Injection\n        var serviceCollection = new ServiceCollection();\n        serviceCollection.RegisterBlobStorageClient(options =>\n        {\n            options.ConnectionString = \"your-blob-storage-connection-string\";\n        });\n        var serviceProvider = serviceCollection.BuildServiceProvider();\n\n        // Resolve BlobStorageClient\n        var blobStorageClient = serviceProvider.GetService<IBlobStorageClient>();\n\n        // Create a blob\n        var blob = new Blob\n        {\n            Name = \"example.txt\",\n            Container = \"my-container\",\n            Text = \"Hello from Azure Blob Storage\"\n        };\n\n        // Upload the blob\n        var uri = await blobStorageClient.Upload(blob);\n        Console.WriteLine($\"Blob uploaded to: {uri}\");\n\n        // Download the blob\n        var stream = await blobStorageClient.Download(blob);\n        using var reader = new StreamReader(stream);\n        var content = await reader.ReadToEndAsync();\n        Console.WriteLine($\"Blob content: {content}\");\n\n        // Delete the blob\n        await blobStorageClient.Delete(blob);\n        Console.WriteLine(\"Blob deleted successfully.\");\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Integrating Blob Storage Client into Azure Functions or ASP.NET Core",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `BlobStorageClient` can be easily integrated into an Azure Function or an ASP.NET Core application using dependency injection. The same principles used for registering the client in a console app can be applied in Azure Functions and ASP.NET Core, with the client being injected into the required services or controllers."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Azure Functions Integration in .NET 8 Isolated Worker",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In .NET 8, Azure Functions use the Isolated Worker model. The `BlobStorageClient` can be registered using the `HostBuilder` in the `Program.cs` file. Once registered, it can be injected into your function classes to handle blob storage operations in response to HTTP or other types of triggers. You will need to ensure that the connection string for Azure Blob Storage is provided in your application configuration."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "ASP.NET Core Integration",
                    "level": 3
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In ASP.NET Core, you can register the `BlobStorageClient` in the `ConfigureServices` method within the `Startup.cs` or `Program.cs`. This will allow the client to be injected into any services or controllers that need to interact with Azure Blob Storage. The connection string can be managed via app settings, and you can inject the `BlobStorageClient` wherever needed."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/storage/blobs/",
                    "text": "Azure Blob Storage Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/azure-functions/",
                    "text": "Azure Functions Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/aspnet/core/",
                    "text": "ASP.NET Core Documentation"
                }
            }
        ]
    },
    {
        "id": 5,
        "title": "B2C Redirect Endpoint Microservice Proof of Concept",
        "slug": "b2c-redirect-endpoint-microservice-poc",
        "author": "John Doe",
        "tags": ["Azure Functions", "B2C", "Microservices", "C#", ".NET"],
        "datePublished": "2024-09-13",
        "excerpt": "A proof of concept for an Azure Function microservice acting as a B2C redirect endpoint, validating user sign-in/up and creating or updating user entities in the database.",
        "image": "/images/b2c-redirect-microservice.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "This post demonstrates a proof of concept for building an Azure Function microservice that acts as a B2C redirect endpoint. The service validates the user sign-in/up using Azure AD B2C, processes the token, and creates or updates user entities in the database."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Setup",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "To implement this microservice, we need to set up the `AuthFlow` service, which includes an Azure Function that handles B2C sign-in and user management. The service uses dependency injection to register services such as `AuthService` and `TokenService`, and the `DbContext` for database interaction."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace AuthFlow\n{\n    public static class DepInj\n    {\n        public static void RegisterServices(\n            this IServiceCollection services, \n            DatabaseOption dbOption, \n            Action<TokenServiceOptions> tokenServiceOptions, \n            Action<AuthServiceOptions> authServiceOptions)\n        {\n            services.AddDatabaseContext<AuthFlowDbContext>(dbOption);\n            services.ConfigureServiceOptions<TokenServiceOptions>((_, opt) => tokenServiceOptions(opt));\n            services.ConfigureServiceOptions<AuthServiceOptions>((_, opt) => authServiceOptions(opt));\n            services.AddTransient<IAuthService, AuthService>();\n            services.AddTransient<ITokenService, TokenService>();\n        }\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `DepInj` class handles the registration of services such as the `AuthService`, `TokenService`, and `DbContext`. This allows seamless interaction between the authentication flow, token processing, and database operations."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Creating the AuthService",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `AuthService` validates the authentication code received from the B2C redirect, decodes the token, and processes the user entity (creating or updating it in the database)."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "public class AuthService(\n    ITokenService tokenService, \n    AuthFlowDbContext dbContext): IAuthService\n{\n    public async Task<bool> VerifyAndProcess(string code, bool update = false)\n    {\n        var jObject = update\n            ? await tokenService.ExchangeCodeForTokenAsync(code, true)\n            : await tokenService.ExchangeCodeForTokenAsync(code);\n\n        if (jObject == null)\n        {\n            return false;\n        }\n\n        var idToken = jObject.Value<string>(\"id_token\");\n        var entity = DecodeIdToken(idToken);\n        if (update)\n        {\n            await UpdateEntity(entity);\n        }\n        else\n        {\n            await CreateNewEntity(entity);\n        }\n        return true;\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In the `AuthService`, we use the `TokenService` to exchange the code for an ID token and decode it to extract user information. The user entity is then created or updated in the database."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "TokenService for Token Exchange",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `TokenService` is responsible for exchanging the code received from the B2C redirect with a token using the OAuth 2.0 flow. It also handles token validation and expiration."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "public class TokenService(\n    IHttpClientFactory httpClientFactory, \n    IOptions<TokenServiceOptions> opt): ITokenService\n{\n    public async Task<JObject?> ExchangeCodeForTokenAsync(string code, bool update = false)\n    {\n        var httpClient = httpClientFactory.CreateClient();\n        var policy = update ? _b2CUpdatePolicy.ToLower() : _b2CSignInUpPolicy.ToLower();\n        var request = new HttpRequestMessage(HttpMethod.Post, $\"{_b2CTokenEndpoint}?p={policy}\");\n        var content = new FormUrlEncodedContent(new[]\n        {\n            new KeyValuePair<string, string>(\"code\", code),\n            new KeyValuePair<string, string>(\"client_id\", _b2CClientId),\n            new KeyValuePair<string, string>(\"client_secret\", _b2CClientSecret),\n            new KeyValuePair<string, string>(\"redirect_uri\", _b2CPostRegisterRedirectUri),\n            new KeyValuePair<string, string>(\"grant_type\", _b2CGrantType),\n            new KeyValuePair<string, string>(\"scope\", _b2CScope)\n        });\n        request.Content = content;\n        var response = await httpClient.SendAsync(request);\n        return response.IsSuccessStatusCode ? JObject.Parse(await response.Content.ReadAsStringAsync()) : null;\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Database Interaction",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The microservice uses Entity Framework Core to interact with the database. The `AuthFlowDbContext` handles CRUD operations for user entities."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "public class AuthFlowDbContext(DbContextOptions<AuthFlowDbContext> options) : DbContext(options)\n{\n    public DbSet<Entity> Entities { get; set; }\n\n    protected override void OnModelCreating(ModelBuilder modelBuilder)\n    {\n        modelBuilder.Entity<Entity>(entity =>\n        {\n            entity.HasKey(e => e.Id);\n            entity.Property(e => e.RefId).IsRequired();\n            entity.Property(e => e.CreatedAt).IsRequired();\n            entity.Property(e => e.UpdatedAt).IsRequired();\n        });\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Azure Functions for Redirect Handling",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The Azure Function microservice contains two endpoints: `PostRegister` and `PostUpdate`. These endpoints handle B2C redirects for user sign-up and updates, respectively."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "public class AuthFlow\n{\n    [Function(nameof(PostRegister))]\n    public async Task<HttpResponseData> PostRegister(\n        [HttpTrigger(AuthorizationLevel.Anonymous, \"get\", \"post\", Route = \"post-register\")]\n        HttpRequestData req,\n        FunctionContext executionContext)\n    {\n        var response = req.CreateResponse();\n        var code = req.Query[\"code\"];\n        \n        if (code == null)\n        {\n            return RedirectResponse(response, _redirectUriUnauthorized);\n        }\n\n        var success = await authService.VerifyAndProcess(code);\n        return success ? RedirectResponse(response, _redirectUriPostRegister) : RedirectResponse(response, _redirectUriUnauthorized);\n    }\n\n    [Function(nameof(PostUpdate))]\n    public async Task<HttpResponseData> PostUpdate(\n        [HttpTrigger(AuthorizationLevel.Anonymous, \"get\", \"post\", Route = \"post-update\")]\n        HttpRequestData req,\n        FunctionContext executionContext)\n    {\n        var response = req.CreateResponse();\n        var code = req.Query[\"code\"];\n        \n        if (code == null)\n        {\n            return RedirectResponse(response, _redirectUriUnauthorized);\n        }\n\n        var success = await authService.VerifyAndProcess(code, true);\n        return success ? RedirectResponse(response, _redirectUriPostUpdate) : RedirectResponse(response, _redirectUriUnauthorized);\n    }\n\n    private HttpResponseData RedirectResponse(HttpResponseData response, string redirectUri)\n    {\n        response.StatusCode = System.Net.HttpStatusCode.Redirect;\n        response.Headers.Add(\"Location\", redirectUri);\n        return response;\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `PostRegister` and `PostUpdate` functions handle the Azure AD B2C redirect for user registration and updates. If the code is valid and the user is processed successfully, the user is redirected to the appropriate URL. Otherwise, they are redirected to the unauthorized URL."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Integrating with Azure Functions and B2C",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "To run the microservice, we need to configure the Azure Function with settings such as the Azure AD B2C policies, token endpoints, client IDs, and secrets. These values can be stored securely using Azure App Configuration and Azure Key Vault, ensuring that sensitive information is protected."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using AuthFlow;\nusing AuthFlow.Data;\nusing Azure.Identity;\nusing Microsoft.Extensions.Configuration;\nusing Microsoft.Extensions.Hosting;\n\nvar host = new HostBuilder()\n    .ConfigureFunctionsWorkerDefaults()\n    .ConfigureAppConfiguration(builder =>\n    {\n        var configuration = builder.Build();\n        var token = new DefaultAzureCredential();\n        var appConfigUrl = configuration[\"app_config_url_in_app_configuration\"] ?? string.Empty;\n        \n        builder.AddAzureAppConfiguration(config =>\n        {\n            config.Connect(new Uri(appConfigUrl), token);\n            config.ConfigureKeyVault(kv => kv.SetCredential(token));\n        });\n    })\n    .ConfigureServices((context, services) =>\n    {\n        var configuration = context.Configuration;\n        \n        services.RegisterServices(new DatabaseOption\n        {\n            ConnectionString = configuration[\"database_connection_string_in_app_configuration\"] ?? string.Empty,\n        }, tokenConfig =>\n        {\n            tokenConfig.TokenEndpoint = configuration[\"token_endpoint_in_app_configuration\"] ?? string.Empty;\n            tokenConfig.SignInUpPolicy = configuration[\"sign_in_up_policy_in_app_configuration\"] ?? string.Empty;\n            tokenConfig.UpdatePolicy = configuration[\"update_policy_in_app_configuration\"] ?? string.Empty;\n            tokenConfig.ClientId = configuration[\"client_id_in_app_configuration\"] ?? string.Empty;\n            tokenConfig.ClientSecret = configuration[\"client_secret_in_app_configuration\"] ?? string.Empty;\n            tokenConfig.Scope = configuration[\"scope_in_app_configuration\"] ?? string.Empty;\n            tokenConfig.GrantType = configuration[\"grant_type_in_app_configuration\"] ?? string.Empty;\n        }, authOpt =>\n        {\n            authOpt.PostRegisterRedirectUri = configuration[\"post_register_redirect_uri_in_app_configuration\"] ?? string.Empty;\n            authOpt.PostUpdateRedirectUri = configuration[\"post_update_redirect_uri_in_app_configuration\"] ?? string.Empty;\n            authOpt.UnauthorizedRedirectUri = configuration[\"unauthorized_redirect_uri_in_app_configuration\"] ?? string.Empty;\n        });\n    })\n    .Build();\n\nhost.Run();"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/active-directory-b2c/",
                    "text": "Azure AD B2C Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/azure-functions/",
                    "text": "Azure Functions Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/ef/core/",
                    "text": "Entity Framework Core Documentation"
                }
            }
        ]
    },
    {
        "id": 6,
        "title": "JWT-Secured Microservice PoC for Flexible Service Injection",
        "slug": "jwt-secured-microservice-poc",
        "author": "John Doe",
        "tags": ["Azure Functions", "JWT", "Microservices", "C#", ".NET", "Security"],
        "datePublished": "2024-09-14",
        "excerpt": "Learn how to build a reusable and flexible JWT-secured microservice PoC for authentication and authorization, allowing for easy service injection and customization.",
        "image": "/images/jwt-secured-microservice.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In this post, we introduce a reusable proof-of-concept (PoC) for building secure microservices using JWT (JSON Web Token). This PoC is designed to offer flexible service injection, allowing developers to add their own services and secure them with JWT validation and claims-based authorization. The key benefit is the ability to have a secured microservice without building the security framework from scratch."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "JWT and Microservice Security",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "JWT is a widely used standard for securely transmitting information, such as user identity and permissions, between parties. By leveraging JWT, this microservice PoC offers authentication and authorization features to ensure that only users with valid tokens can access the service. Developers can extend the PoC with their own logic while inheriting these security features."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "PoC Overview",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "This PoC provides JWT token validation and scope-based authorization out of the box. You can inject your services, such as business logic or data processing, into this framework and rely on the provided security layer to ensure only authorized users can access the microservice."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Service Registration and Configuration",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The core of this PoC is the ability to inject services into a secured microservice environment. The following example shows how to register JWT validation options, token services, and your custom services for use in a secure context."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "public static class DepInj\n{\n    public static void RegisterServices(\n        this IServiceCollection services, \n        Action<TokenValidationOptions> tokenValidationOptions, \n        Action<AuthorizationScope> authorizationScope)\n    {\n        services.ConfigureServiceOptions<TokenValidationOptions>((_, opt) => tokenValidationOptions(opt));\n        services.ConfigureServiceOptions<AuthorizationScope>((_, opt) => authorizationScope(opt));\n        services.AddSingleton<IJwtValidatorService, JwtValidatorService>();\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Here, you register core security services such as JWT validation and authorization scope management. By injecting your services into this structure, you can add your custom functionality while ensuring security is handled by the underlying framework."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "JWT Validation Logic",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "This PoC includes a robust JWT validation mechanism. When an HTTP request contains a JWT in the `Authorization` header, the service verifies the token's validity, checks the required scopes, and extracts user-specific claims like the unique identifier (OID). You can extend this to ensure only authorized users with the right claims can access your custom service logic."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "public class JwtValidatorService(IOptions<TokenValidationOptions> opt) : IJwtValidatorService\n{\n    public async Task<string?> AuthenticateAndAuthorize(HttpRequestData req, string[] acceptedScopes)\n    {\n        if (!req.Headers.TryGetValues(\"Authorization\", out var authHeaders))\n        {\n            return null;\n        }\n\n        var authHeader = authHeaders.FirstOrDefault();\n        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith(\"Bearer \"))\n        {\n            return null;\n        }\n\n        var bearerToken = authHeader.Substring(\"Bearer \".Length);\n        try\n        {\n            var openIdConfig = await _configurationManager.GetConfigurationAsync(CancellationToken.None);\n            var validationParameters = new TokenValidationParameters\n            {\n                ValidateIssuer = true,\n                ValidIssuer = _issuer,\n                ValidateAudience = true,\n                ValidAudience = _clientId,\n                ValidateLifetime = true,\n                IssuerSigningKeys = openIdConfig.SigningKeys\n            };\n\n            var tokenHandler = new JwtSecurityTokenHandler();\n            var principal = tokenHandler.ValidateToken(bearerToken, validationParameters, out SecurityToken validatedToken);\n\n            var scopes = principal.Claims\n                .Where(c => c.Type == \"scp\" || c.Type == \"scope\")\n                .SelectMany(c => c.Value.Split(' '))\n                .ToList();\n\n            if (!scopes.Any(scope => acceptedScopes.Contains(scope)))\n            {\n                return null;\n            }\n\n            return principal.Claims.FirstOrDefault(c => c.Type == \"oid\")?.Value;\n        }\n        catch\n        {\n            return null;\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Custom Service Injection and Extension",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The main benefit of this PoC is its extensibility. You can inject your services into the secure environment and rely on JWT validation to protect your business logic. For example, you can inject a database service to ensure that only authorized users can access and manipulate data."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "public class ProtectedFunction(\n    IJwtValidatorService jwtValidatorService, IOptions<AuthorizationScope> opt)\n{\n    private readonly AuthorizationScope _protectedScope = opt.Value;\n    \n    [Function(nameof(Protected))]\n    public async Task<HttpResponseData> Protected(\n        [HttpTrigger(AuthorizationLevel.Anonymous, \"get\", Route = null)] \n        HttpRequestData req, ExecutionContext executionContext)\n    {\n        var acceptedScopes = new[] { _protectedScope.TestScope };\n        var userId = await jwtValidatorService.AuthenticateAndAuthorize(req, acceptedScopes);\n        \n        var response = req.CreateResponse();\n        if (userId == null)\n        {\n            response.StatusCode = HttpStatusCode.Unauthorized;\n            return response;\n        }\n        response.StatusCode = HttpStatusCode.OK;\n        return response;\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In this protected API function, the injected `JwtValidatorService` handles the security logic. Developers can add their custom service functionality here while leveraging the secure framework provided by the JWT validation PoC."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow",
                    "text": "OAuth 2.0 Client Credentials Grant Flow"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/azure-functions/",
                    "text": "Azure Functions Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/active-directory-b2c/authorization-v2",
                    "text": "Azure AD B2C Authorization Documentation"
                }
            }
        ]
    },
    {
        "id": 7,
        "title": "CRM Database Migration Using FluentMigrator and Azure App Configuration",
        "slug": "crm-database-migration-with-fluentmigrator",
        "author": "John Doe",
        "tags": ["Azure", "FluentMigrator", "C#", ".NET", "Database", "App Configuration"],
        "datePublished": "2024-09-14",
        "excerpt": "Learn how to set up CRM database migration using FluentMigrator, Azure Identity, and Azure App Configuration in a .NET 8 application.",
        "image": "/images/database-migration.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In this post, we explore how to set up database migration for a CRM system using FluentMigrator, Azure Identity, and Azure App Configuration in a .NET 8 application. FluentMigrator provides a powerful framework for handling versioned database migrations, while Azure App Configuration allows for centralized management of connection strings and other critical settings."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Project Setup and Dependencies",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "We start by defining the project setup in a .NET SDK project file, including references to key packages like `Azure.Identity`, `FluentMigrator`, and `AzureAppConfiguration`. These packages enable seamless authentication, database migration, and configuration management."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "xml",
                    "code": "<Project Sdk=\"Microsoft.NET.Sdk\">\n    <PropertyGroup>\n        <OutputType>Exe</OutputType>\n        <TargetFramework>net8.0</TargetFramework>\n        <ImplicitUsings>enable</ImplicitUsings>\n        <Nullable>enable</Nullable>\n    </PropertyGroup>\n    <ItemGroup>\n        <PackageReference Include=\"Azure.Identity\" Version=\"1.12.0\" />\n        <PackageReference Include=\"FluentMigrator\" Version=\"5.2.0\" />\n        <PackageReference Include=\"FluentMigrator.Runner\" Version=\"5.2.0\" />\n        <PackageReference Include=\"Microsoft.Extensions.Configuration.AzureAppConfiguration\" Version=\"7.3.0\" />\n    </ItemGroup>\n    <ItemGroup>\n        <None Update=\"Migrations\\**\\*.sql\">\n            <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>\n        </None>\n    </ItemGroup>\n</Project>"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Main Program Logic",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `Main` method controls the migration flow, allowing developers to migrate the database up or down based on command-line arguments. It also integrates Azure App Configuration for managing settings such as the database connection string, which is securely retrieved using Azure Identity."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using Azure.Identity;\nusing FluentMigrator.Runner;\nusing Microsoft.Extensions.Configuration;\nusing Microsoft.Extensions.DependencyInjection;\nnamespace CRM.Common.DatabaseMigration\n{\n    public class Program\n    {\n        public static IConfiguration Configuration { get; private set; }\n\n        static void Main(string[] args)\n        {\n            bool migrateUp = true;\n            long? targetVersion = null;\n\n            if (args.Length > 0)\n            {\n                if (args[0] == \"down\")\n                {\n                    migrateUp = false;\n                    if (args.Length > 1 && long.TryParse(args[1], out long version))\n                    {\n                        targetVersion = version;\n                    }\n                    else\n                    {\n                        Console.WriteLine(\"Please specify a valid version number to rollback to.\");\n                        return;\n                    }\n                }\n            }\n\n            var services = new ServiceCollection();\n            ConfigureServices(services);\n            using var serviceProvider = services.BuildServiceProvider();\n            using (var scope = serviceProvider.CreateScope())\n            {\n                var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();\n                if (migrateUp) runner.MigrateUp();\n                else if (targetVersion.HasValue) runner.MigrateDown(targetVersion.Value);\n            }\n        }\n\n        static void ConfigureServices(IServiceCollection services)\n        {\n            var builder = new ConfigurationBuilder()\n                .AddAzureAppConfiguration(options =>\n                {\n                    var appConfigEndpoint = \"https://fulfill3d-app-config-alpha.azconfig.io\";\n                    var credential = new DefaultAzureCredential();\n                    options.Connect(new Uri(appConfigEndpoint), credential)\n                           .ConfigureKeyVault(kv => kv.SetCredential(credential));\n                });\n            Configuration = builder.Build();\n            var connectionString = Configuration[\"CRM_ConnectionString_Db\"];\n            if (string.IsNullOrEmpty(connectionString))\n                throw new InvalidOperationException(\"Database connection string is not configured.\");\n            services.AddFluentMigratorCore()\n                    .ConfigureRunner(rb => rb.AddSqlServer().WithGlobalConnectionString(connectionString))\n                    .AddLogging(lb => lb.AddFluentMigratorConsole());\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Custom Migrations and Versioning",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The PoC includes a custom migration class that supports both up and down migrations by executing SQL scripts. This migration approach allows for greater control over SQL-based schema changes and rollbacks."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using FluentMigrator;\nnamespace CRM.Common.DatabaseMigration.Helper\n{\n    public class CustomMigration : Migration\n    {\n        public override void Down()\n        {\n            Execute.Script(GetSqlFile(\"DOWN\"));\n        }\n        public override void Up()\n        {\n            Execute.Script(GetSqlFile(\"UP\"));\n        }\n        private string GetSqlFile(string extension)\n        {\n            var className = this.GetType().Name;\n            var sqlFileName = className + \"_\" + extension + \".sql\";\n            var path = Path.Combine(\"Migrations\", className, sqlFileName);\n            if (!File.Exists(path))\n                throw new FileNotFoundException($\"The SQL file {path} was not found.\");\n            return path;\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Date-based Migration Attributes",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "We use a custom attribute `DateMigration` to automatically generate migration version numbers based on the date and time, making it easy to track migration versions and ensure consistency across deployments."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using FluentMigrator;\nnamespace CRM.Common.DatabaseMigration.Helper\n{\n    public class DateMigrationAttribute(int year, int month, int day, int hour, int minute) : MigrationAttribute(CalculateValue(year, month, day, hour, minute))\n    {\n        private static long CalculateValue(int year, int month, int day, int hour, int minute)\n        {\n            return year * 100000000L + month * 1000000L + day * 10000L + hour * 100L + minute;\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Sample Migration",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "Below is an example of a migration class using the `DateMigration` attribute for tracking. This class links to the SQL scripts required for the migration and rollback operations."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using CRM.Common.DatabaseMigration.Helper;\nnamespace CRM.Common.DatabaseMigration.Migrations._2024_07_31_18_37_Migration\n{\n    [DateMigration(2024, 7, 31, 18, 37)]\n    public class _2024_07_31_18_37_Migration: CustomMigration\n    {\n    }\n}"
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The actual SQL scripts (`_2024_07_31_18_37_Migration_UP.sql` and `_2024_07_31_18_37_Migration_DOWN.sql`) define the migration logic for schema changes and rollbacks."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "sql",
                    "code": "-- _2024_07_31_18_37_Migration_UP.sql\n-- SQL migration logic goes here"
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "sql",
                    "code": "-- _2024_07_31_18_37_Migration_DOWN.sql\n-- SQL rollback logic goes here"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://fluentmigrator.github.io/",
                    "text": "FluentMigrator Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/azure/app-configuration/",
                    "text": "Azure App Configuration Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8",
                    "text": ".NET 8 Features"
                }
            }
        ]
    },
    {
        "id": 8,
        "title": "HTTP Request Body Mapping and Validation Using FluentValidation",
        "slug": "http-request-body-mapping-with-fluentvalidation",
        "author": "John Doe",
        "tags": ["FluentValidation", "C#", ".NET", "Validation", "Dependency Injection"],
        "datePublished": "2024-09-14",
        "excerpt": "Learn how to implement HTTP request body mapping and validation using FluentValidation in .NET, ensuring clean and validated inputs in your API services.",
        "image": "/images/http-request-body-mapping.png",
        "status": "published",
        "contentBlocks": [
            {
                "type": "heading",
                "data": {
                    "text": "Introduction",
                    "level": 1
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "In this post, we demonstrate how to implement an HTTP request body mapper and validation mechanism using FluentValidation in .NET. This approach allows developers to map incoming HTTP request bodies to strongly-typed objects and validate them, ensuring clean and structured inputs for APIs."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Dependency Injection Setup",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The following code snippet shows how to set up dependency injection for the HTTP request body mapper and FluentValidation. The `AddHttpRequestBodyMapper` extension method registers the body mapper, while `AddFluentValidator` enables automatic registration of validators from the specified assembly."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace Template\n{\n    public static class DepInj\n    {\n        private static void AddHttpRequestBodyMapper(this IServiceCollection services)\n        {\n            services.AddTransient(typeof(IHttpRequestBodyMapper<>), typeof(HttpRequestBodyMapper<>));\n        }\n\n        private static void AddFluentValidator<T>(this IServiceCollection services)\n        {\n            services.AddValidatorsFromAssembly(typeof(T).Assembly);\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Interface for HTTP Request Body Mapping",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `IHttpRequestBodyMapper` interface defines methods for mapping and validating the HTTP request body. It supports both basic deserialization (`Map`) and validation of the mapped object (`MapAndValidate`)."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "namespace CRM.Common.Services.Interfaces\n{\n    public interface IHttpRequestBodyMapper<T>\n    {\n        Task<T> Map(Stream requestBody);\n        Task<T> MapAndValidate(Stream requestBody);\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Model and Validation with FluentValidation",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "We define a sample `Request` model and a corresponding `RequestValidator` using FluentValidation. The validator ensures that the `Value` property is not empty, trimmed of whitespace, and does not exceed 255 characters."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using FluentValidation;\nusing Newtonsoft.Json;\n\nnamespace Template.Data.Models\n{\n    public class Request\n    {\n        [JsonProperty(\"value\")]\n        public string Value { get; set; }\n    }\n\n    public class RequestValidator : AbstractValidator<Request>\n    {\n        public RequestValidator()\n        {\n            RuleFor(x => x.Value.Trim())\n                .NotEmpty().WithMessage(\"Value is required\")\n                .MaximumLength(255).WithMessage(\"Value must be less than 255 characters\");\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "HTTP Request Body Mapper Implementation",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "The `HttpRequestBodyMapper` class implements the `IHttpRequestBodyMapper` interface. It deserializes the request body into a strongly-typed object and validates it using FluentValidation."
                }
            },
            {
                "type": "code",
                "data": {
                    "language": "csharp",
                    "code": "using FluentValidation;\nusing Newtonsoft.Json;\nusing Template.Services.Interfaces;\n\nnamespace Template.Services\n{\n    public class HttpRequestBodyMapper<T>(IValidator<T> validator) : IHttpRequestBodyMapper<T>\n    {\n        public async Task<T> Map(Stream requestBody)\n        {\n            if (requestBody == null) throw new ArgumentNullException(nameof(requestBody));\n\n            using var streamReader = new StreamReader(requestBody);\n            var deserializedObject = JsonConvert.DeserializeObject<T>(await streamReader.ReadToEndAsync());\n            \n            if (deserializedObject == null)\n            {\n                throw new InvalidOperationException(\"Deserialization returned null.\");\n            }\n\n            return deserializedObject;\n        }\n\n        public async Task<T> MapAndValidate(Stream requestBody)\n        {\n            T obj = await Map(requestBody);\n            await validator.ValidateAndThrowAsync(obj);\n            return obj;\n        }\n    }\n}"
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Putting It All Together",
                    "level": 2
                }
            },
            {
                "type": "paragraph",
                "data": {
                    "text": "By combining the dependency injection setup, request body mapper, and validation, you can seamlessly integrate these features into your API services. The `HttpRequestBodyMapper` ensures that all incoming requests are correctly deserialized and validated before they are processed further."
                }
            },
            {
                "type": "heading",
                "data": {
                    "text": "Further Reading",
                    "level": 2
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://fluentvalidation.net/",
                    "text": "FluentValidation Documentation"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/dotnet/core/dependency-injection",
                    "text": "Dependency Injection in .NET"
                }
            },
            {
                "type": "hyperlink",
                "data": {
                    "href": "https://learn.microsoft.com/en-us/dotnet/api/system.io.stream",
                    "text": "Stream Class in .NET"
                }
            }
        ]
    }
];
