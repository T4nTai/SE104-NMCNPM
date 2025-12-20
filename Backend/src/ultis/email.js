// emailTemplates/studentAccountEmail.js
export function studentAccountEmailHtml({
  hoTenHocSinh,
  websiteTruong,
  tenDangNhap,
  matKhau,
  tenTruong,
  emailHoTro,
  soDienThoaiHoTro,
}) {
  const safe = (v) =>
    String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const _hoTen = safe(hoTenHocSinh);
  const _web = safe(websiteTruong);
  const _user = safe(tenDangNhap);
  const _pass = safe(matKhau);
  const _school = safe(tenTruong);
  const _mail = safe(emailHoTro);
  const _phone = safe(soDienThoaiHoTro);

  const webLink = websiteTruong ? `<a href="${_web}" style="color:#2563eb;text-decoration:none;">${_web}</a>` : "";

  return `
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Thông tin tài khoản đăng nhập</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Tài khoản đăng nhập hệ thống học sinh: ${_user}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(17,24,39,.08);">
          <!-- Header -->
          <tr>
            <td style="padding:22px 24px;background:#0b5fff;color:#ffffff;">
              <div style="font-size:18px;font-weight:700;line-height:1.2;">${_school || "Nhà trường"}</div>
              <div style="font-size:13px;opacity:.9;margin-top:6px;">Thông tin tài khoản đăng nhập hệ thống học sinh</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">
              <div style="font-size:15px;line-height:1.6;">
                Chào em <b>${_hoTen || "học sinh"}</b>,<br/>
                Nhà trường đã tạo tài khoản để em đăng nhập vào hệ thống học sinh.
              </div>

              <div style="height:16px;"></div>

              <!-- Info box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6ff;border:1px solid #dbe6ff;border-radius:12px;">
                <tr>
                  <td style="padding:16px 16px;">
                    <div style="font-size:14px;font-weight:700;color:#1f2a44;margin-bottom:10px;">🔐 Thông tin đăng nhập</div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6;color:#111827;">
                      <tr>
                        <td style="padding:4px 0;width:160px;color:#374151;">Website</td>
                        <td style="padding:4px 0;">${webLink || _web}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#374151;">Tên đăng nhập</td>
                        <td style="padding:4px 0;"><b>${_user}</b></td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#374151;">Mật khẩu tạm thời</td>
                        <td style="padding:4px 0;"><b>${_pass}</b></td>
                      </tr>
                    </table>

                    <div style="margin-top:12px;font-size:13px;color:#374151;">
                      👉 Em vui lòng <b>đổi mật khẩu ngay lần đầu sử dụng</b> và không chia sẻ tài khoản cho người khác.
                    </div>
                  </td>
                </tr>
              </table>

              <div style="height:18px;"></div>

              <!-- CTA -->
              ${
                websiteTruong
                  ? `
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background:#0b5fff;border-radius:10px;">
                      <a href="${_web}" style="display:inline-block;padding:12px 16px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
                        Đăng nhập hệ thống
                      </a>
                    </td>
                  </tr>
                </table>
              `
                  : ""
              }

              <div style="height:18px;"></div>

              <div style="font-size:13px;line-height:1.6;color:#374151;">
                Nếu có vấn đề đăng nhập, em liên hệ giáo viên chủ nhiệm hoặc bộ phận hỗ trợ CNTT của trường.
              </div>

              <div style="height:16px;"></div>

              <div style="font-size:14px;line-height:1.6;">
                Chúc em học tốt 🌱<br/>
                <b>${_school || "Nhà trường"}</b>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.5;">
              ${
                emailHoTro || soDienThoaiHoTro
                  ? `
                Hỗ trợ: ${emailHoTro ? `📧 <a href="mailto:${_mail}" style="color:#2563eb;text-decoration:none;">${_mail}</a>` : ""}
                ${emailHoTro && soDienThoaiHoTro ? " | " : ""}
                ${soDienThoaiHoTro ? `📞 ${_phone}` : ""}
                <br/>
              `
                  : ""
              }
              Lưu ý: Đây là email tự động. Vui lòng không trả lời email này.
            </td>
          </tr>
        </table>

        <div style="height:14px;"></div>
        <div style="font-size:11px;color:#9ca3af;">
          © ${new Date().getFullYear()} ${_school || "School"}.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
