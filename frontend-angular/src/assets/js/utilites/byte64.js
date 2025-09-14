export function objectToBase64(obj) {
    const jsonString = JSON.stringify(obj); // تبدیل به رشته
    const utf8Bytes = new TextEncoder().encode(jsonString); // انکد کردن به UTF-8
    const base64String = btoa(String.fromCharCode(...utf8Bytes)); // تبدیل به base64
    return base64String;
}
 
export function base64ToObject(base64String) {
    const binaryString = atob(base64String);
    const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
    const jsonString = new TextDecoder().decode(bytes);
    return JSON.parse(jsonString);
}

