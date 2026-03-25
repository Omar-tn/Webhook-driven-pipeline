export async function sendWithRetry(
    url: string,
    payload: any,
    retries = 3,
    delayMs = 1000

) {

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt} => ${url}`);

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            console.log("Success");
            return true;

        } catch (err) {
            console.error(`Failed attempt ${attempt}:`, err);

            if (attempt === retries) {
                console.error("All retries failed");
                return false;
            }

            await new Promise(r => setTimeout(r, delayMs));
        }
    }
}