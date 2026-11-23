package com.getcapacitor;

import android.os.Build;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import java.util.List;
import org.json.JSONObject;

public class WhooshBridgeWebViewClient extends BridgeWebViewClient {

    private final Bridge mBridge;
    private String lastFailedUrl = "";
    private String lastErrorCode = "";
    private String lastErrorDesc = "";

    public WhooshBridgeWebViewClient(Bridge bridge) {
        super(bridge);
        this.mBridge = bridge;
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);

        if (url != null && url.contains("connection-error.html")) {
            try {
                String safeUrl = JSONObject.quote(lastFailedUrl != null && !lastFailedUrl.isEmpty() ? lastFailedUrl : (mBridge.getServerUrl() != null ? mBridge.getServerUrl() : ""));
                String safeCode = JSONObject.quote(lastErrorCode != null ? lastErrorCode : "");
                String safeDesc = JSONObject.quote(lastErrorDesc != null ? lastErrorDesc : "");
                String js = "if (window.setConnectionErrorInfo) { window.setConnectionErrorInfo(" + safeUrl + ", " + safeCode + ", " + safeDesc + "); }";
                view.evaluateJavascript(js, null);
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        List<WebViewListener> webViewListeners = mBridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : webViewListeners) {
                listener.onReceivedError(view);
            }
        }

        String errorPath = mBridge.getErrorUrl();
        if (errorPath != null && request != null && request.isForMainFrame()) {
            String failingUrl = request.getUrl() != null ? request.getUrl().toString() : "";

            // Prevent loop if error page itself fails
            if (failingUrl.contains("connection-error.html")) {
                return;
            }

            // Check if relevant to dev server connection
            String devServerUrl = mBridge.getServerUrl();
            boolean isDevFailure = devServerUrl != null && (
                failingUrl.startsWith(devServerUrl) ||
                failingUrl.startsWith("http://192.168.") ||
                failingUrl.startsWith("http://10.") ||
                failingUrl.startsWith("http://172.") ||
                failingUrl.startsWith("http://localhost") ||
                failingUrl.startsWith("http://127.0.0.1")
            );

            if (isDevFailure) {
                lastFailedUrl = failingUrl;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && error != null) {
                    int code = error.getErrorCode();
                    CharSequence desc = error.getDescription();
                    lastErrorDesc = desc != null ? desc.toString() : "";
                    lastErrorCode = mapErrorCode(code, lastErrorDesc);
                } else {
                    lastErrorCode = "net::ERR_CONNECTION_FAILED";
                    lastErrorDesc = "Koneksi ke server gagal";
                }

                // Important: Load EXACT errorPath without query parameters so WebViewLocalServer.isErrorUrl() matches!
                view.loadUrl(errorPath);
                return;
            }

            view.loadUrl(errorPath);
            return;
        }

        super.onReceivedError(view, request, error);
    }

    @Override
    public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
        List<WebViewListener> webViewListeners = mBridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : webViewListeners) {
                listener.onReceivedHttpError(view);
            }
        }

        String errorPath = mBridge.getErrorUrl();
        if (errorPath != null && request != null && request.isForMainFrame()) {
            String failingUrl = request.getUrl() != null ? request.getUrl().toString() : "";

            if (failingUrl.contains("connection-error.html")) {
                return;
            }

            String devServerUrl = mBridge.getServerUrl();
            boolean isDevFailure = devServerUrl != null && (
                failingUrl.startsWith(devServerUrl) ||
                failingUrl.startsWith("http://192.168.") ||
                failingUrl.startsWith("http://10.") ||
                failingUrl.startsWith("http://localhost")
            );

            if (isDevFailure) {
                lastFailedUrl = failingUrl;
                int statusCode = errorResponse != null ? errorResponse.getStatusCode() : 0;
                lastErrorCode = "HTTP_" + statusCode;
                lastErrorDesc = errorResponse != null && errorResponse.getReasonPhrase() != null ? errorResponse.getReasonPhrase() : ("HTTP Status " + statusCode);

                // Load exact errorPath
                view.loadUrl(errorPath);
                return;
            }

            view.loadUrl(errorPath);
            return;
        }

        super.onReceivedHttpError(view, request, errorResponse);
    }

    private String mapErrorCode(int code, String description) {
        if (description != null && description.startsWith("net::")) {
            return description;
        }
        switch (code) {
            case ERROR_HOST_LOOKUP:
                return "net::ERR_NAME_NOT_RESOLVED";
            case ERROR_CONNECT:
                return "net::ERR_CONNECTION_REFUSED";
            case ERROR_TIMEOUT:
                return "net::ERR_TIMED_OUT";
            case ERROR_FAILED_SSL_HANDSHAKE:
                return "net::ERR_SSL_PROTOCOL_ERROR";
            default:
                return description != null && !description.isEmpty() ? description : ("ERROR_CODE_" + code);
        }
    }
}
