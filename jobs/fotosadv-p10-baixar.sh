# Baixa as fotos geradas pela fa-img (bucket público match-site/fotosadv) para fotosadv/2026-11-03-p10/raw
O=fotosadv/2026-11-03-p10/raw; mkdir -p $O; : > $O/job.log
U=https://cdtfglylekiyxdmrgbne.supabase.co/storage/v1/object/public/match-site/fotosadv
for p in p01 p02 p03 p04 p05 p06 p07 p08 p09 p10; do for e in selfie bracos mesa palestra varanda notebook corredor; do
  curl -sSL -f -o $O/${p}_${e}.png -w "${p}_${e} %{http_code} %{size_download}\n" "$U/${p}_${e}.png" >> $O/job.log 2>&1 || rm -f $O/${p}_${e}.png
done; done
