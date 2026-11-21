Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfPageRenderOptions,Windows.Data.Pdf,ContentType=WindowsRuntime] | Out-Null
$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.IsGenericMethod -and $_.GetGenericArguments().Count -eq 1 } | Select-Object -First 1
function Await($operation,$type) {
  $task=$asTask.MakeGenericMethod($type).Invoke($null,@($operation))
  $task.GetAwaiter().GetResult()
}
$file=Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Join-Path $pwd 'Book Hub Barueri.pdf'))) ([Windows.Storage.StorageFile])
$pdf=Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
$pdf.PageCount
$asTaskAction = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncAction" }; foreach ($n in 38,39) {
  $page=$pdf.GetPage($n-1)
  $stream=[Windows.Storage.Streams.InMemoryRandomAccessStream]::new()
  $options=[Windows.Data.Pdf.PdfPageRenderOptions]::new()
  $options.DestinationWidth=6000
  ($asTaskAction.Invoke($null,@($page.RenderToStreamAsync($stream,$options)))).GetAwaiter().GetResult()
  $stream.Seek(0)
  $output=[IO.File]::Create((Join-Path $pwd "page-$n.jpg"))
  [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream).CopyTo($output)
  $output.Dispose()
  $page.Dispose()
}


