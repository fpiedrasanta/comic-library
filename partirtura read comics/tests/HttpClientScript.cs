using System.Net.Http;
using System.IO;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var path = @"C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\tests\Taskmaster Vol.3 #02.cbr";
        var fileBytes = await File.ReadAllBytesAsync(path);
        var content = new StreamContent(new MemoryStream(fileBytes));
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
        
        using var formData = new MultipartFormDataContent();
        formData.Add(content, "file", Path.GetFileName(path));
        
        using var client = new HttpClient();
        var resp = await client.PostAsync("http://localhost:5173/api/admin-works/1/content/retry", formData);
        var body = await resp.Content.ReadAsStringAsync();
        System.Console.WriteLine($"Status: {resp.StatusCode}");
        System.Console.WriteLine(body);
    }
}
