O=fotosadv/2026-11-01-orbita-andre/vozes; mkdir -p $O
curl -sSL -o $O/A1_gancho.mp3 -w "A1 %{http_code} %{size_download}\n" https://d8j0ntlcm91z4.cloudfront.net/user_38lL1t3zHzVQDjU5qT29V8iXM0u/hf_20261101_041007_ae6f1a71-beda-44ea-9a22-4b2159185388.mp3 > $O/job.log 2>&1
curl -sSL -o $O/A2_gancho.mp3 -w "A2 %{http_code} %{size_download}\n" https://d8j0ntlcm91z4.cloudfront.net/user_38lL1t3zHzVQDjU5qT29V8iXM0u/hf_20261101_041008_2f46144f-db20-4ee6-b1dd-2ef3c7823de7.mp3 >> $O/job.log 2>&1
exit 0
