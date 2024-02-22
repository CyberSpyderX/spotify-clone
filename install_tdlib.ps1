git clone https://github.com/tdlib/td.git
cd td
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
git checkout cd5e746ec203c8c3c61647e0886a8df8c1e78e41
./bootstrap-vcpkg.bat
./vcpkg.exe install gperf:x64-windows openssl:x64-windows zlib:x64-windows
cd ..
Remove-Item build -Force -Recurse -ErrorAction SilentlyContinue
mkdir build
cd build
cmake -A x64 -DCMAKE_INSTALL_PREFIX:PATH=../tdlib -DCMAKE_TOOLCHAIN_FILE:FILEPATH=../vcpkg/scripts/buildsystems/vcpkg.cmake ..
cmake --build . --target install --config Release
cd ..
cd ..
dir td/tdlib