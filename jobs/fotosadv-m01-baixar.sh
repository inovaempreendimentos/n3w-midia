# Baixa as fotos da mulher fictícia m01 (fa-img, bucket público) para fotosadv/2026-11-03-formatos/raw
O=fotosadv/2026-11-03-formatos/raw; mkdir -p $O; : > $O/job.log
U=https://cdtfglylekiyxdmrgbne.supabase.co/storage/v1/object/public/match-site/fotosadv
for e in selfie bracos mesa palestra varanda notebook corredor; do
  curl -sSL -f -o $O/m01_${e}.png -w "m01_${e} %{http_code} %{size_download}\n" "$U/m01_${e}.png" >> $O/job.log 2>&1 || rm -f $O/m01_${e}.png
done
